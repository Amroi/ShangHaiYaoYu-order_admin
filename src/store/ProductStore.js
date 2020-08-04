import { observable, computed, action } from 'mobx';
import ajax from '../util/api/ajax';
import { stringify } from 'qs';
import loginUtil from '../util/login';
import { message } from 'antd';

class ErpProductStore {
    @observable dataList = [];
    @observable total = 0;
    @observable page = 1;
    @observable page_size = 10;
    @observable loading = false;
    @observable editorStatus = false;
    @observable prodTypeList = [];
    currentEntity = null;
    filter = {};

    user = () => loginUtil.getUserInfo();

    @action
    queryTypeList = async () => {
        this.loading = true;
        try {
            const resp = await ajax({ url: "/erp/product/type/list" });
            if (resp.success) {
                this.prodTypeList = resp.data;
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    load = async (params) => {
        params.page_size = this.page_size;
        params.page = params.page ? params.page : this.page;
        params.company_id = this.user().company.id;
        this.loading = true;
        try {
            let resp = await ajax({ url: '/erp/product/list?' + stringify(params) });
            if (resp.success) {
                this.dataList = resp.data;
                this.total = resp.total;
                this.page = params.page;
            }
            this.filter = { ...params };
            return resp;
        } finally {
            this.loading = false;
        }
    }

    @action
    onPageChange = (page) => {
        this.filter.page = page;
        this.page = page;
        this.load(this.filter)
    }

    @action
    handleSearch = (params = {}) => {
        params.page_size = this.page_size;
        params.return_total = true;
        params.page = 1;
        this.load(params);
    }

    @action
    handleEdit = async (record) => {
        this.loading = true;

        const params = stringify({
            company_id: this.user().company.id,
            id: record.id,
            erp_product_id: record.id
        });
        try {
            this.currentEntity = { ...record };

            const product_color_list = await ajax({ url: '/erp/product/product_color/list?' + params, method: 'get', });
            if (product_color_list.success) {
                this.currentEntity.product_color_list = product_color_list.data;
            }
            const product_spec_list = await ajax({ url: '/erp/product/product_spec/list?' + params, method: 'get', });
            if (product_spec_list.success) {
                this.currentEntity.product_spec_list = product_spec_list.data;
            }
            const product_public_list = await ajax({ url: '/erp/o2o/product/GetErpPublicList?' + params, method: 'get', });
            if (product_public_list.success) {
                this.currentEntity.product_public_list = product_public_list.data;
            }
            this.editorStatus = true;
        } finally {
            this.loading = false;
        }
    }

    @action
    handleSave = async (entity) => {

        entity.company_id = this.user().company.id;
        entity.post_user = this.user().name;
        entity.post_user_id = this.user().id;
        const resp = await ajax({ url: '/erp/o2o/product/PostErpProduct', method: 'post', 'data': stringify(entity) });
        if (resp.success) {
            message.success(`${entity.display_name}发布成功`);
            this.currentEntity = null;
            this.editorStatus = false;
        } else {
            message.error(resp.msg);
        }
    }

    @action
    handleCancel = () => {
        this.editorStatus = false;
    }
}

//#endregion
//线上机型管理
class O2OProductStore {
    @observable dataList = [];
    @observable total = [];
    @observable page = 1;
    @observable page_size = 10;
    @observable loading = false;
    @observable orderRuleEditorStatus = false;
    @observable selectedRowKeys = [];
    currentEntity = null;
    filter = {};
    rule_delta = [];

    user = () => loginUtil.getUserInfo();

    @action
    load = async (params) => {
        params.page_size = this.page_size;
        params.company_id = this.user().company.id;
        params.post_user = this.user().name;
        this.loading = true;
        try {
            let resp = await ajax({ url: '/erp/o2o/product/list?' + stringify(params), method: 'get', });
            if (resp.success) {
                this.dataList = resp.data;
                this.total = resp.total;
                this.page = params.page;
            }
            this.filter = { ...params };
            return true;
        } finally {
            this.loading = false;
        }
    }

    @action
    removeProd = async (id) => {
        if (!id) {
            message.warn('商品 ID 错误');
            return;
        }
        this.loading = true;
        const resp = await ajax({ url: `/erp/o2o/product/remove/` + id, method: 'DELETE' });
        if (resp) {
            if (resp.success) {
                message.success(resp.msg);
                this.load(this.filter);
            } else {
                message.warn(resp.msg);
            }
        };
        this.loading = false;
    }

    @action
    onPageChange = (page) => {
        this.filter.page = page;
        this.load(this.filter)
    }

    @action
    changeStatus = async (entity, status) => {
        const params = {
            company_id: this.user().company.id,
            post_user: this.user().name,
            id: entity.id,
            status: status,
        }
        this.loading = true;
        let resp = await ajax({ url: `/erp/o2o/product/ChangeProductStatus`, method: 'post', data: stringify(params) });
        if (resp.success) {
            entity.is_public = status;
        }
        message.success(resp.msg);
        this.loading = false;
    }

    @action
    handleSearch = (params = {}) => {
        params.page_size = this.page_size;
        params.return_total = true;
        params.page = 1;
        this.load(params);
    }

    setDefaultCurEntity = () => {
        this.currentEntity = { 'company_id': this.user().company.id, 'create_user': this.user().name };
        this.currentEntity.order_rules = [];
        return true;
    }

    @action
    showOrderRuleEditor = async (entity, action) => {
        if (action == 'new') {
            this.currentEntity = { 'company_id': this.user().company.id, 'create_user': this.user().name };
            this.currentEntity.order_rules = [];
            // this.orderRuleEditorStatus = true;
        } else {
            this.rule_delta = [];
            this.loading = true;
            let resp = await ajax({ url: `/erp/o2o/product/order_rules/${entity.id}`, method: 'get' });
            if (resp.success) {
                this.currentEntity = entity;
                this.currentEntity.order_rules = resp.data;
            }
            // this.orderRuleEditorStatus = true;
        }
        this.loading = false;
        window.location.href = '#/online/product/edit'
    }

    @action
    handleSaveRule = (rule = {}, action) => {
        if (action == 'create') {
            rule = {
                "id": new Date().getTime().toString(),
                "version": 1,
                product_id: this.currentEntity.id,
                isNew: true,
                enable_order: true,
            };
        } else if (action == 'remove' && !rule.isNew) {
            const idx = this.rule_delta.findIndex(item => item.id == rule.id);
            if (idx === -1) {
                rule.version = 0;
                this.rule_delta.push(rule);
            }
        }
        return { success: true, data: rule };
    }

    @action
    hideOrderRuleEditor = () => {
        this.currentEntity = null;
        this.orderRuleEditorStatus = false;
        this.loading = false;
        // 读取售价规则       
    }
    @action
    handleQuoted = (entity, action) => {
        this.loading = true;
        entity.editing = action == 'edit';
        this.loading = false;
    }

    @action
    handleSaveProduct = async (product, action) => {
        if (this.loading) {
            return;
        }
        let postEntity = { ...product };
        postEntity.post_user = this.user().name;
        postEntity.spec_customer_price = product.spec_customer_price_checked ? 2 : 1;
        postEntity.order_rules = JSON.stringify(product.order_rules.concat(this.rule_delta));
        this.currentEntity = { ...postEntity };
        this.loading = true;
        try {
            // 读取售价规则   
            let resp = await ajax({ url: `/erp/o2o/product/update?action=update`, method: 'post', 'data': stringify(postEntity) });
            if (resp.success) {
                this.hideOrderRuleEditor();
                message.success('更新成功');
                window.history.back(-1);
            } else {
                message.error(resp.msg);
            }
            return resp;
        } finally {
            this.loading = false;
        }

    }
    @action
    setSelectRowKey = (keys) => {
        this.selectedRowKeys = keys;
    }
}

// 商品库存管理
class O2OProductStockStore {
    @observable dataList = [];
    @observable total = [];
    @observable page = 1;
    @observable page_size = 10;
    @observable loading = false;
    @observable editorStatus = 0;
    @observable selectedRowKeys = [];
    @observable selectedProductId = 0;
    @observable customerStockDataList = null; //客户库存

    constructor() {
        this.currentEntity = null;
    }

    user = () => loginUtil.getUserInfo();

    @action     // 导出单个商品的分货数据
    exportCustomerStockListWithProd = async (productId) => {
        if (!productId) {
            message.warn('没有可导出数据');
            return;
        }
        this.loading = true;
        try {
            let resp = await ajax({ url: `/erp/o2o/product/stock/customer/export/list?id=` + productId, responseType: 'blob' });
            if (resp.type.indexOf('json') > -1) {
                message.warn('导出数据失败');
                return;
            }
            const blob = new Blob([resp])
            const elink = document.createElement('a')
            elink.download = '商品分货数据导出.xlsx';
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
        } finally {
            this.loading = false;
        }
    }

    @action     // 清空当前商品所有客户分货
    handleAllClear = async (productId) => {
        if (!productId) {
            message.warn('没有库存可清除');
            return;
        }
        try {
            this.loading = true;
            const resp = await ajax({ url: '/erp/o2o/product/stock/customer/clear/' + productId, method: "DELETE" });
            if (resp) {
                if (resp.success) {
                    this.hideEditor();
                    message.success('清除成功');
                    this.load(this.filter);
                } else {
                    message.error(resp.msg);
                }
            }

        } finally {
            this.loading = false;
        }
    }

    @action
    load = async (params) => {
        params.page = params.page ? params.page : this.page;
        params.page_size = this.page_size;
        params.company_id = this.user().company.id;
        params.post_user = this.user().name;
        this.loading = true;
        try {
            let resp = await ajax({ url: '/erp/o2o/product/stock/list?' + stringify(params), method: "POST" });
            if (resp.success) {
                this.dataList = resp.data;
                this.total = resp.total;
                this.page = params.page;
            }
            this.filter = { ...params };
            return true;
        } finally {
            this.loading = false;
        }
    }

    @action
    onPageChange = (page) => {
        this.filter.page = page;
        this.selectedRowKeys = [];
        this.load(this.filter)
    }


    @action
    handleSearch = (params = {}) => {
        params.page_size = this.page_size;
        params.return_total = true;
        params.page = 1;
        this.load(params);
    }


    @action
    showEditor = (entity, editFlag) => {
        this.currentEntity = entity;
        this.editorStatus = editFlag;
    }

    @action
    hideEditor = () => {
        this.currentEntity = null;
        this.editorStatus = 0;
        this.selectedProductId = 0;
    }

    @action
    handleSave = async (product, action) => {
        if (this.loading) {
            return
        }
        this.loading = true;
        let postEntity = { ...product };
        postEntity.post_user = this.user().name;
        postEntity.order_rules = JSON.stringify(product.order_rules);
        // 读取售价规则   
        let resp = await ajax({ url: `/erp/o2o/product/stock/update`, method: "POST", 'data': stringify(postEntity) });

        if (resp.success) {
            message.success('更新成功');
        } else {
            message.error(resp.msg);
            this.loading = false;
            return;
        }
        this.editorStatus = 0;
        await this.load(this.filter);
        return resp;
    }

    postCustomerStock = async (postData) => {
        this.loading = true;
        postData.post_user = this.user().name;
        try {
            const resp = await ajax({ url: `/erp/o2o/product/stock/UpdateCustomerStock`, method: "POST", 'data': stringify(postData) });
            if (!resp.success) {
                message.error(resp.msg);
                return false;
            }
            this.hideEditor();
            message.success(resp.msg);
            await this.load(this.filter);
            return true;
        } finally {
            this.loading = false;
        }
    }

    // 查询客户库存
    queryCustomerStock = async (product_id, customer_id) => {
        let postData = {};
        postData.post_user = this.user().name;
        postData.value = product_id ? product_id : this.selectedProductId;
        postData.query_type = 'product';
        postData.page = 1;
        postData.page_size = 10000;
        postData.customer_id = customer_id;
        postData.company_id = this.user().company.id;
        if (product_id) {
            this.selectedProductId = product_id;
        }
        try {
            this.loading = true;
            const resp = await ajax({ url: `/erp/o2o/product/stock/GetCustomerStockList`, method: "POST", 'data': stringify(postData) });
            if (!resp.success) {
                message.error(resp.msg);
                this.customerStockDataList = [];
                return false;
            }
            this.customerStockDataList = resp.data;
        } finally {
            this.loading = false;
        }
        this.editorStatus = 3;
        return true;
    }

    checkCustomerExistsByName = async (items) => {
        const names = items.map(item => item.customer_name);
        message.loading('正在处理,请稍后...', 0);
        let resp;
        try {
            resp = await ajax({ url: `/erp/customer/CheckName`, 'data': stringify({ company_id: this.user().company.id, names: names.join(",") }) });
            if (!resp.success) {
                message.warn(resp.msg);
                return { success: false };;
            }
        } finally {
            message.destroy();
        }

        const customerList = [];
        resp.data.forEach(item => { customerList[item.name] = item });
        let error_list = [];
        let err_count = 0;
        for (let i = 0; i < items.length; i++) {
            const cus = items[i];
            cus.pass = false;
            // 如果客户存在
            if (customerList[cus.customer_name]) {
                cus.pass = true;
                cus.customer_id = customerList[cus.customer_name].id;
            } else {
                cus.customer_name = cus.customer_name + ' 不存在'
                error_list.push(cus);
                err_count++;
            }
        }

        if (err_count > 0) {
            message.error(`资料有${err_count}条错误`);
            return { success: false, data: error_list };
        }


        return { success: true, data: items };
    }

    @action
    downloadProductTemplate = async () => {
        if (this.loading) {
            return
        }

        this.loading = true;
        try {
            let postEntity = { company_id: this.user().company.id, post_user: this.user().name };
            let resp = await ajax({ url: `/erp/o2o/product/stock/customer_template`, method: 'post', responseType: 'blob', 'data': stringify(postEntity) });
            const blob = new Blob([resp])
            const elink = document.createElement('a')
            elink.download = '商品分货模板.xlsx';
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
        } finally {
            this.loading = false;
        }
    }

    @action         // 删除客户分货
    removeStock = async (param) => {
        this.loading = true;
        try {
            let resp = await ajax({ url: `/erp/o2o/product/stock/log/remove`, method: "POST", 'data': stringify(param) });
            message.destroy();
            if (resp.success) {
                message.success(resp.msg);
                this.queryCustomerStock(param.product_id);
            } else {
                message.warn(resp.msg);
            }
            this.load(this.filter);
            return resp.success;
        } finally {
            this.loading = false;
        }
    }
    // 同步erp库存
    @action
    syncErpProduct = async (product) => {
        let postEntity = {
            product_id: product.id,
            post_user: this.user().name,
        }
        this.loading = true;
        try {
            let resp = await ajax({
                url: `/erp/o2o/product/stock/syncErp`,
                method: "POST",
                'data': stringify(postEntity)
            });
            if (resp.success) {
                message.success(resp.msg);
                this.load(this.filter);
            } else {
                message.warn(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    // 同步全部 ERP 库存
    @action
    allSyncErpStock = async () => {
        try {
            this.loading = true;
            const resp = await ajax({ url: `/erp/o2o/product/stock/all/syncErp`, method: "POST" });
            if (resp.success) {
                message.success(resp.msg);
                this.load(this.filter);
            } else {
                message.warn(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    // 批量同步 ERP 库存
    @action
    batchSyncErpStock = async (id) => {
        if (this.selectedRowKeys.length === 0) {
            message.info('请选择同步的产品！');
            return;
        }
        let postEntity = {
            id_list: [...this.selectedRowKeys].toString()
        }
        try {
            this.loading = true;
            const resp = await ajax({ url: `/erp/o2o/product/stock/batch/syncErp`, method: "POST", 'data': stringify(postEntity) });
            if (resp.success) {
                message.success(resp.msg);
                this.load(this.filter);
            } else {
                message.warn(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    UpdateStockSyncFlag = async (record) => {
        try {
            this.loading = true;
            let sync_stock_flag = record.sync_stock_flag == 1 ? true : false;
            const resp = await ajax({
                url: `O2OService.UpdateStockSyncFlag`,
                method: "POST", 'data': { sku_id: record.id, sync_stock_flag: sync_stock_flag }
            });
            if (resp.success) {
                record.sync_stock_flag = record.sync_stock_flag == 1 ? 2 : 1;
                message.success(resp.msg);

            } else {
                message.warn(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }
}
export { ErpProductStore, O2OProductStore, O2OProductStockStore };