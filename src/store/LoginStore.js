 import { action, observable } from 'mobx';
 import ajax from '../util/api/ajax'; 
 import { stringify } from 'qs';
 import axios from 'axios';
 import loginUtil from '../util/login';
import { message } from 'antd';

class loginStore {

    @observable companyList = [];

    @action
    doLogin = async (params) => {
        let resp = await ajax({ url: '/erp/user/login', method: 'post', data: stringify(params)});      
        if(resp.success) {             
            axios.defaults.headers.common['access_token']  =  resp.access_token;  
            sessionStorage.setItem('access_token', resp.access_token);
        } else {
            axios.defaults.headers.common['access_token'] = "";
        }
        loginUtil.saveUserInfo(resp.user)
        return resp;
    }

    @action
    getCompanyList = async() => {
        const resp = await ajax({ url: "/erp/company/all"});
        if (resp && resp.success) {
            this.companyList = resp.data;
        } else {
            message.warn("获取公司列表失败，请刷新！");
        }
    }

    @action
    doLoginOut() {
        sessionStorage.remove('access_token');
    }
    

}

export default loginStore;