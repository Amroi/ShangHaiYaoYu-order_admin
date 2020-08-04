import { observable, action } from "mobx";
import ajax from '../util/api/ajax';
import { message } from "antd";
import { stringify } from 'qs';

class NoticeStore {
    @observable data = [];
    @observable page = 1;
    @observable pageSize = 10;
    @observable total = 0;
    @observable editVisible = false;
    @observable editData = null;
    @observable loading = false;
    @observable deleteVisible = false;
    @observable delData = null;

    filter = {}

    @action
    fetch = async (params) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/notice/list?'+stringify(params), method: 'get' });
            if (resp.success) {
                this.data = resp.data;
                this.total = resp.total;
                this.page = params.page;
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    submit = async (params) => {
        this.loading = true;
        let resp;
        try {
            if (params.id && params !== '0') {
                resp = await ajax({ url: '/erp/o2o/notice/update', method: 'put', data: params });
            } else {
                resp = await ajax({ url: '/erp/o2o/notice/add', method: 'post', data: params });
            }
            if (resp.success) {
                message.success(resp.msg);
                this.changeEditVisible(false);
                this.fetch(this.filter);
            } else {
                message.error(resp.msg);
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    handleDelete = async(notice_id) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/notice/delete/'+notice_id, method: 'delete' });
            if (resp.success) {
                message.success(resp.msg);
                this.changeDelVisible(false);
                this.fetch(this.filter)
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    changeDelVisible = (status, delData) => {
        this.deleteVisible = status;
        this.delData = delData;
    }

    changeEditVisible = (status) => {
        this.editVisible = status;
        if (!status) {
            this.editData = null;
        }
    }

    handleEdit = (editData) => {
        this.editData = editData;
        this.editVisible = true;
    }

    handlePageChange = (page) => {
        this.filter.page = page;
        this.fetch(this.filter);
    }
}

export default NoticeStore;