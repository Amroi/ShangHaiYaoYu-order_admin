import LoginStore from './LoginStore';
import HomeStore from './HomeStore';
import { ErpProductStore , O2OProductStore } from  './ProductStore';
import O2OUserStore from './O2OUserStore';
import OnlineOrderStore from './OnlineOrderStore'
import OnlineAccountStore from './OnlineAccountStore';
import OnlinePaymentStore from './OnlinePaymentStore';
import ProductLimitRuleStore from './ProductLimitRuleStore';
import ProductPackageStore from './ProductPackageStore';
import NoticeStore from './NoticeStore';
import O2OReceiptAddrStore from './O2OReceiptAddrStore';
import CouponStore from "./CouponStore";
import GiftStore from "./GiftStore";

export default {  
  loginStore: new LoginStore(),
  homeStore: new HomeStore(),  
  erp_productStore: new ErpProductStore(),
  o2o_productStore: new O2OProductStore(),
  o2oUserStore: new O2OUserStore(),
  o2oOrderStore: new OnlineOrderStore(),
  o2oAccountStore: new OnlineAccountStore(),
  paymentStore: new OnlinePaymentStore(),
  productLimitRuleStore: new ProductLimitRuleStore(),
  productPackageStore: new ProductPackageStore(),
  noticeStore: new NoticeStore(),
  o2oReceiptAddrStore: new O2OReceiptAddrStore(),
  couponStore: new CouponStore(),
  giftStore: new GiftStore(),
};
