import { observable, action } from 'mobx';
import ajax from '../util/api/ajax';
import { message } from 'antd';
import { stringify } from "qs";

export default class O2OReceiptAddrStore {
    @observable data = []
    @observable page = 1
    @observable pageSize = 10
    @observable total = 0
    @observable loading = false
    @observable photoVisible = false
    @observable photoUrl = ""
    @observable editVisible = false
    @observable editData = null
    @observable status = 0
    filter = {}


    @action     // 同步地址到 ERP
    syncToErp = async (receiptId) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/user/receipt/addr/sync?id=' + receiptId });
            if (resp && resp.success) {
                message.success(resp.msg);
            } else {
                resp && message.warn(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    fetch = async (params) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/user/receipt/addr/list?' + stringify(params) });
            if (resp.success) {
                this.data = resp.data;
                this.total = resp.total;
                if ((params.page * params.pageSize < resp.total) && params.page > 0) {
                    params.page -= 1;
                }
                this.page = params.page;
            } else {
                message.error(resp.msg)
            }
            this.filter = { ...params }
        } finally {
            this.loading = false;
        }
    }

    @action
    audit = async (params) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/user/receipt/addr/audit', method: 'PUT', "data": params });
            if (resp.success) {
                message.success(resp.msg);
                this.showEditModal();
                this.fetch(this.filter);
            } else {
                message.error(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    deleteReceiptAddr = async (id) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/user/receipt/addr/del/' + id, method: 'DELETE' })
            if (resp.success) {
                message.success(resp.msg);
                this.fetch(this.filter);
            } else {
                message.error(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    handlePageChange = (p) => {
        this.filter.page = p;
        this.fetch(this.filter);
    }

    showEditModal = (params) => {
        this.editVisible = !this.editVisible;
        this.editData = params;
    }
    showPhoto = (url) => {
        if (typeof url !== 'string') {
            url = '';
        }
        this.photoUrl = url;
        this.photoVisible = !this.photoVisible;
    }

    handleSearch = (vals) => {
        this.status = vals.status;
        let params = {
            ...this.filter,
            ...vals
        }
        this.fetch(params);
    }

}