import { observable, action } from 'mobx';
import ajax from '../util/api/ajax';
import { stringify } from 'qs';
import { message } from 'antd';

export default class OnlineAccountStore {
    @observable data = []
    @observable loading = false
    @observable editVisible = false
    @observable delVisible = false
    @observable editData = null
    @observable delData = null

    @action
    fetch = async (params) => {
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/bank/list?' + stringify(params), method: 'get' });
            if (resp.success) {
                this.data = resp.data
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    handleSubmit = async (params) => {

        this.loading = true;
        try {
            // 如果存在 id，则为更新，否则为新增
            let resp
            if (params.id) {
                resp = await ajax({ url: `/erp/o2o/bank/update/${params.id}`, method: 'post', data: params });
            } else {
                resp = await ajax({ url: '/erp/o2o/bank/create', method: 'post', data: params });
            }
            if (resp.success) {
                message.success(resp.msg)
                this.changeEditVisible(null)
                this.fetch()
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    @action
    handleDelete = async () => {
        this.loading = true;
        try {
            const resp = await ajax({ url: `/erp/o2o/bank/delete/` + this.delData.id, method: 'delete' })
            if (resp.success) {
                message.success(resp.msg)
                this.changeDelVisible(null)
                this.fetch()
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    changeEditVisible = (editData) => {
        this.editVisible = !this.editVisible
        this.editData = editData;
    }

    changeDelVisible = (data) => {
        this.delVisible = !this.delVisible
        this.delData = data
    }
}