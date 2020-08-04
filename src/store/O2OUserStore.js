import { observable, action } from 'mobx';
import ajax from '../util/api/ajax'; 
import { stringify } from 'qs';
import { message } from 'antd';

export default class O2OUserStore {
    @observable data= []
    @observable userInfo = []
    @observable selectedRowKeys = []
    @observable page = 1
    @observable pageSize = 10
    @observable total = 0
    @observable photoVisible = false
    @observable delUserVisible = false
    @observable reviewVisble = false
    filter = {}
    photoUrl1 = ''
    photoUrl2 = ''
    @observable oneRow = {}
    @observable status = 0
    @observable loading = false

    @action
    fetch = async (params) => {
        this.loading = true;
        params.page = params.page ? params.page : this.page
        params.pageSize = params.pageSize ? params.pageSize : this.pageSize
        params.status = params.status ? params.status : this.status

        try {
            const resp = await ajax({ url: '/erp/o2o/user/list?'+stringify(params), method: 'get' });
            if(resp.success) {
                this.data = resp.data;
                this.total = resp.total;
                this.page = params.page;
            } else {
                message.error(resp.msg)
            }
//             this.filter = { ...params }
        } finally {
             this.loading = false;
        }
    }
    
    @action
    exportReport = async () => {
        this.loading = true;
        try {
            let resp = await ajax({ url: `/erp/o2o/user/register/export`, method: 'get', responseType: 'blob' }); 
            const blob = new Blob([resp])        
            const elink = document.createElement('a')
            elink.download = '用户注册信息表.xlsx';
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
    handlePageChange = (page) => {
        this.filter.page = page;
        this.page = page;
        this.fetch(this.filter)
    }

    @action
    handleStatusChange = (status) => {
        this.filter.page = 1;
        this.page = 1;
        this.filter.status = status
        this.status = status
        this.fetch(this.filter)      
    }
    
    @action
    handleSearch = (params) => {
        this.filter.page = 1;
        this.page = 1;
        this.filter = {
            ...this.filter,
            ...params
        }
        this.fetch(this.filter)      
    }

    @action
    handleAudit = async(params) => {
        this.loading = true;
        try {
            let resp = await ajax({ url: '/erp/o2o/user/audit', method: 'post', 'data': params });
            if(resp.success) {
                message.success(resp.msg)
                this.handleReviewModal(null)
                this.fetch(this.filter)
            } else {
                message.error(resp.msg)
            }
//             this.filter = { ...params }
        } finally {
             this.loading = false;
        }
    }

    @action
    repealUser = async(params) => {
        this.loading = true;
        let param = {
            id: params.id,
            mobile: params.mobile,
        }
        try {
            const resp = await ajax({url: '/erp/o2o/user/repeal?'+stringify(param), method: 'POST'});
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

    showPhoto = (url1, url2) => {
        if (typeof url1 !== 'string') {
            url1 = '';
        }
        if (typeof url2 !== 'string') {
           url2 = '';
        }
        this.photoUrl1 = url1;
        this.photoUrl2 = url2;
        this.photoVisible = !this.photoVisible;
    }

    handleReviewModal = (record) => {
        this.reviewVisble = !this.reviewVisble;
        this.oneRow = record;
    }

    resetData = () => {
        this.data = []
        this.userInfo = []
        this.selectedRowKeys = []
        this.page = 1
        this.pageSize = 10
        this.total = 0
        this.photoVisible = false
        this.delUserVisible = false
        this.reviewVisble = false
        this.filter = {}
        this.photoUrl1 = ''
        this.photoUrl2 = ''
        this.oneRow = {}
        this.status = 0
    }
}