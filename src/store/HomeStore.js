import { extendObservable, action } from 'mobx';
import moment from 'moment';
import { getSummary, getData } from 'util/api';
import ajax from '../util/api/ajax';
import loginUtils from '../util/login';

export default class HomeStore {
  constructor() {
   
  }

  @action
  reset = async (init) => {
      // 拉取用户信息
      let resp =  await ajax({ url: '/erp/user/current', method: "POST"});
      if(resp.success) {
         loginUtils.saveUserInfo(resp.user);
      }
  }

  @action
  onWillMount = async () => {
    await this.reset();
 
  }

  @action
  getSummary = async () => {
    
  }

  @action
  changeIndicator = async (indicatorId) => {
   
  }

  @action
  changeDateRange = async (_, rangeStr = []) => {
   
  }

  getData = async () => {
    
  }

  transform2Chart = (title, categories, series) => {
     
  }
}
