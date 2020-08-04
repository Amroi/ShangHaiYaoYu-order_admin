import { observable ,computed , action } from 'mobx';
import ajax from '../util/api/ajax'; 
import { stringify } from 'qs';
import  loginUtil from '../util/login';
import { message } from 'antd';

/**
 * 颜色store
 */
export class ErpProductColorStore {
    @observable  dataList = [];
    @observable loading = false;
    @observable editorStatus = false;
    currentEntity = null;
    filter = {};
     

    user = () => loginUtil.getUserInfo();
    
     /**
      * 查询商品颜色配置列表
      */
    @action
    load_product_color_list = async ( product_id ) => {
        this.loading = true;
        try {        
            let resp = await ajax({ url:`/erp/product/product_color/list?id=${product_id}&company_id=${this.user().company.id}`, method: 'get',  });               
            if(resp.success) {
                this.dataList = resp.data;
            }
          
            return resp;
        }finally{
            this.loading = false;
        }
    }

    
     
}
