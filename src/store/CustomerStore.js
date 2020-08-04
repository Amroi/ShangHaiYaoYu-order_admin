import { observable ,computed , action } from 'mobx';
import ajax from '../util/api/ajax'; 
import { stringify } from 'qs';
import  loginUtil from '../util/login';
import { message } from 'antd';

export default class ErpCustomerStore {
    @observable  dataList = [];
    @observable total = 0;
    @observable page = 1;
    @observable page_size = 10;
    @observable loading = false;
    @observable editorStatus = false;

     
    load = async ( params ) => {
        params.page_size = this.page_size;
        params.page = params.page ? params.page : this.page;
        this.loading = true;
        try {        
            let resp = await ajax({ url: '/erp/customer/list?' +stringify(params), method:'get',   });              
            if(resp.success) {
                this.dataList = resp.data;
                this.total = resp.total;
                this.page = params.page;
            }
            this.filter = { ...params };
            return resp;
        }finally{
            this.loading = false;
        }
    }
   
    @action
    onPageChange =(page) => {
        this.filter.page = page;
        this.page = page;
        this.load(this.filter)
    }

    @action
    handleSearch = ( params = { }) => {               
        params.page_size = this.page_size;
        params.return_total = true;
        params.page = 1;      
        this.load(params);
    }
}