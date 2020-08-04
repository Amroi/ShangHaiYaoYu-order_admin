/**
 * 字典Store
 */
import { observable ,computed , action } from 'mobx';
import ajax from '../util/api/ajax'; 
import { stringify } from 'qs';
import  loginUtil from '../util/login';
import { message } from 'antd';

class DictStore {
   /**
    * 查询客户类型
    */
    @action getCustomerType = () => {
        return loadDictItem()
    }

    @action loadDictItem = ( dict_id)=> {
        return ajax({url:`/erp/sys/dict/item/${dict_id}`}, method:"get")
    }
}