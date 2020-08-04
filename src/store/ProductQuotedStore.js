import { observable ,computed , action } from 'mobx';
import ajax from '../util/api/ajax'; 
import { stringify } from 'qs';
import  loginUtil from '../util/login';
import { message } from 'antd';


//线上机型管理
class O2OProductQuotedStore {
    @observable  dataList = [];
    @observable total = [];
    @observable page = 1;
    @observable page_size = 10;
    @observable loading = false;
    preList = [];
    filter = {
        is_public: "1",
    };

    user =()=>loginUtil.getUserInfo();

    @action
    load = async ( params ) => {
        params.page_size = this.page_size;
        params.company_id = this.user().company.id;
        params.post_user = this.user().name;
        this.filter = {
            ...this.filter,
            ...params,
        }
        this.loading = true;
        try {        
            let resp = await ajax({ url: '/erp/o2o/product/list?'+stringify(this.filter), method: 'get',  });              
            if(resp.success) {
                this.dataList = resp.data;
                this.preList = resp.data;
                this.total = resp.total;
                this.page = params.page;
            }
            return true;
        } finally {
            this.loading = false;
        }
    }
   
    @action
    onPageChange =(page) => {
        let params = {
            page: page,
        }
        this.load(params);
    }
     
    @action
    handleSearch = ( params = {}) => {
        params.return_total = true;
        params.page = 1;
        this.load(params);
    }
      
    @action
    handleQuoted = (entity, action) => {
        if(action === 'save')  {
            entity.editing = false;
            return this.handleSave(entity, 'update');
        }
        if (action === 'cancel') {
            this.dataList = this.preList.slice(0);
        }
        this.loading = true;
        entity.editing = action == 'edit';
        this.loading = false;    
    }
   
    @action
    handleSave = async (product, action) => {  
        if(this.loading) {
            return;
        }
        this.loading = true;
        let postEntity = { ...product };
        postEntity.post_user = this.user().name;        
        postEntity.order_rules = JSON.stringify(product.order_rules);              
        // 读取售价规则   
        try {
            let resp = await ajax({ url: `/erp/o2o/product/update?action=update`, method: 'post', 'data': stringify(postEntity) });                   
            if(resp.success) { 
                message.success('更新成功');
                this.load(this.filter);                 
            }  else {
                message.error(resp.msg);
            }
            return resp; 
        } finally {
            this.loading = false;
        }
        return false;
    }

    export = async() => {
        if(this.loading) {
            return;
        }
        this.loading = true;
        try {
            let postEntity = { company_id: this.user().company.id, post_user: this.user().name};
            let resp = await ajax({ url: `/erp/o2o/product/quoted/export`, method: 'post', responseType: 'blob', 'data': stringify(postEntity) }); 
            const blob = new Blob([resp])        
            const elink = document.createElement('a')
            elink.download = '报价单.xlsx';
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
        }finally{
            this.loading = false;
        }
                
    }
     
}
const store = new O2OProductQuotedStore();
export default store;