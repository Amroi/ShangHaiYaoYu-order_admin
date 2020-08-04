import { observable, computed, action } from 'mobx';
import ajax from '../util/api/ajax';
import { stringify } from 'qs';
import loginUtil from '../util/login';
import { message } from 'antd';

/**
 * 订单store
 */
class OnlineOrderStore {
    @observable dataList = [];
    @observable total = 0;
    @observable page = 1;
    @observable page_size = 10;
    @observable loading = false;
    currentEntity = null;
    filter = {};
    @observable editorStatus = false;
    @observable resonVisible = false;
    cancel_id = "0";
    customer_id = "0";

    user = () => loginUtil.getUserInfo();
    @observable warehouse_id = 0;
    @observable location_id = 0;
    @observable logisticsVisible = false;
    @observable logisticsInfo = null;

    @action // 订单信息导出
    handleExport = async(params) => {
        this.loading = true;
        try {
            let resp = await ajax({ url: `/erp/o2o/order/list/export?`+stringify(params), responseType: 'blob' }); 
            const blob = new Blob([resp])        
            const elink = document.createElement('a')
            elink.download = '订单信息导出.xlsx';
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

    @action
    load = async (params) => {
        params.page_size = this.page_size;
        params.page = params.page ? params.page : this.page;
        params.company_id = this.user().company.id;
        params.load_customer = true;
        this.loading = true;
        try {
            let resp = await ajax({ url: '/erp/o2o/order/list?' + stringify(params), });
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
    hideEditor = () => {
        this.editorStatus = false;
    }

    @action
    showEditor = async (id) => {
        const isOk = await this.getOrderInfo(id);
        if (isOk) {
            this.editorStatus = true;
            return;
        }
        message.destroy();
        message.warn('查询订单明细数据错误');
    }

    // 查询订单详情
    @action
    getOrderInfo = async (id) => {
        this.loading = true;
        try {
            let resp = await ajax({ url: `/erp/o2o/order/detail/${id}`, method: "POST" });
            if (resp.success) {
                this.currentEntity = resp.data;
                return true;
            }
        } finally {
            this.loading = false;
        }
        return false;
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
    handleCancelOrder = async (reason) => {
        try {
            this.loading = true;
            let params = {
                id: this.cancel_id,
                customer_id: this.customer_id,
                reason: reason,
            }
            const resp = await ajax({ url: '/erp/o2o/order/bs/cancel', method: "POST", data: stringify(params) });
            if (resp.success) {
                message.success(resp.msg);
                this.showResonVisible(null);
                this.hideEditor();
                this.load(this.filter);
            } else {
                message.error(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    // 取消订单弹窗
    showResonVisible = (params) => {
        if (params) {
            this.cancel_id = params.id;
            this.customer_id = params.customer_id;
        }
        this.resonVisible = !this.resonVisible;
    }

    // 更新订单明细
    @action
    updateItemPrice = async (entity) => {
        let data = {
            price: entity.price,
            qty: entity.qty,
            id: entity.id,
            mid: entity.mid,
        }
        entity.amount = entity.price * entity.qty - entity.discount;
        const resp = await ajax({ url: '/erp/o2o/order/item/price', method: "POST", data: stringify(data) });
        if (resp.success) {
            message.success('更新成功')
        } else {
            message.error(resp.msg);
        }
        return resp.success;
    }

    @action 
    showLogisticsRouter = async(orderId) => {
        if (!orderId) {
            message.warn("物流单号为空");
            return;
        }
        this.loading = true;
        // 查询物流路由
        try {
            const resp = await ajax({url: "/erp/o2o/order/ship/" + orderId});
            if (resp && resp.success) {
                this.logisticsInfo = resp.data;
            }
            this.changeLogisticsVisible(true);
        } finally {
            this.loading = false;
        }
        
    }

    @action
    createErpSaleOrder = async (entity) => {
        this.loading = true;
        let items = entity.items.map(item => ({
            id: item.id || 0,
            product_id: item.erp_product_id,
            color_id: item.erp_color_id,
            config_id: item.erp_config_id,
            qty: item.qty,
            price: item.price,
            money: item.qty * item.price,
            remark: item.product.indexOf("(礼品)") !== -1 ? "礼品" : entity.remark,
            p1: item.sku,
            p2: item.discount.toString(),
            p3: item.is_gift ? 'gift' : '',
        }));
        //创建erp订单
        let postData = {            
            order_code: entity.order_code,
            order_id: entity.id,
            warehouse_id: this.warehouse_id,
            location_id: this.location_id,
            order_type: 3, //线上订单
            pickup_mode: entity.pickup_mode,
            remark: entity.remark,            
            customer_id: entity.customer_id,
            items: JSON.stringify(items)

        }
        if (!postData.warehouse_id) {
            message.warn("请选择发货仓库")
            this.loading = false;
            return
        }
        let resp = await ajax({ url: "/erp/sale/order/create", method: "POST", data: stringify(postData) });
        if (resp.success) {
            this.editorStatus = false;
            message.success(`创建订单成功${resp.data.code}`)
            return this.load(this.filter);
        } else {
            message.error(resp.msg);
        }
        this.loading = false;

    }


    @action
    selectWarehouse = (items) => {
        this.warehouse_id = items.shop_id;
        this.location_id = items.id;
        sessionStorage.setItem('default_select_warehouse_id', items.id);
    }

    changeLogisticsVisible = (status) => {
        this.logisticsVisible = status;
    }
}

export default OnlineOrderStore;