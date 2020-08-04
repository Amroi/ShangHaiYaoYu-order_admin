import { message } from 'antd';
const USER_INFO = 'user_info';
let user = undefined;
export default {
  isLogin: () => true ,
  saveUserInfo: (val) => {
     user = { ...val};
     sessionStorage.setItem(USER_INFO, JSON.stringify(val));
  },

  getUserInfo: () => {
    if(user) {
      return user;
    }
    let data = sessionStorage.getItem(USER_INFO);   
  
    try {      
      user = JSON.parse(data);
      user.company_id = user.company.id;
    } catch (error) {
        
    }    

    return user ? user : {};
  },


  logout: () => {
    sessionStorage.removeItem(USER_INFO);
  }
};
