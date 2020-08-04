import React from 'react';
import loadable from 'react-loadable';
import Loading from 'component/Loading';
import { hot } from 'react-hot-loader';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import { Provider } from 'mobx-react';
import App from 'layout/App';
import store from 'store';
import { ConfigProvider } from 'antd';
import loginUtil from 'util/login';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import 'antd/dist/antd.css';
import 'stylesheet/cantd.less';
import 'stylesheet/app.less';

function getComponentAsync(loader) {
  return loadable({
    loader: () => loader,
    loading: Loading,
    timeout: 10000
  });
}

const Root = () => (
  <Provider {...store}>
    <ConfigProvider locale={zh_CN}>
      <HashRouter>
        <React.Fragment>
          <Switch>

            <Route exact path="/login" component={getComponentAsync(import(/* webpackChunkName: "Login" */ "page/Login/index"))} />
            {
              loginUtil.isLogin()
                ? (

                  <App>
                    <Switch>
                      <Route
                        exact
                        path="/online/product/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_list'))}
                      />
                      <Route
                        exact
                        path="/online/product/edit"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_edit'))}
                      />

                      <Route
                        exact
                        path="/online/product/quoted"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_quoted'))}
                      />
                      <Route
                        exact
                        path="/online/product/stock/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_stock'))}
                      />
                      //商品限购
                      <Route
                        exact
                        path="/online/product/order/limit/rule"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_limit_rule_list'))}
                      />
                      <Route
                        exact
                        path="/online/product/package"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_package'))}
                      />
                      <Route
                        exact
                        path="/online/product/gift"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_gift'))}
                      />
                      <Route
                        exact
                        path="/online/product/coupon"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/CouponList'))}
                      />
                      <Route
                        exact
                        path="/online/logistics/rule"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/LogisticsRule'))}
                      />
                      <Route
                        exact
                        path="/online/product/ladder"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Product/o2o_product_ladder'))}
                      />
                      // 订单管理路由
                      // 用户审核
                      <Route
                        exact
                        path="/online/user/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/UserList'))}
                      />
                      // 订单审核
                      <Route
                        exact
                        path="/online/order/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/OrderList'))}
                      />
                      // 帐号列表
                      <Route
                        exact
                        path="/online/account/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/AccountList'))}
                      />
                      // 收款核对
                      <Route
                        exact
                        path="/online/payment/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/PaymentList'))}
                      />
                      // 收货地址审核
                      <Route
                        exact
                        path="/online/receipt/list"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/ReceiptList'))}
                      />
                      <Route
                        exact
                        path='/online/book/list'
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/O2O/Book/BookList'))}
                      />
                      // 通知管理
                      <Route
                        exact
                        path="/online/notice/manager"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Message/NoticeManager'))}
                      />
                      // 功能设置
                      <Route 
                        exact
                        path='/online/setting/carousel'
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/FeatSetting/CarouselSetting'))}
                         />
                      // 额度管理
                      <Route
                        exact
                        path="/online/amount/manager"
                        component={getComponentAsync(import(/* webpackChunkName: "StepForm" */ 'page/Amount/AmountManager'))}
                      />
                      <Route
                        exact
                        path="/project/result/success"
                        component={getComponentAsync(import(/* webpackChunkName: "SuccessResult" */ 'page/Result/Success'))}
                      />
                      <Route
                        exact
                        path="/project/result/error"
                        component={getComponentAsync(import(/* webpackChunkName: "ErrorResult" */ 'page/Result/Error'))}
                      />

                      <Route
                        exact
                        path="/project/exception/403"
                        component={getComponentAsync(import(/* webpackChunkName: "E403" */ 'page/403'))}
                      />
                      <Route
                        exact
                        path="/project/exception/404"
                        component={getComponentAsync(import(/* webpackChunkName: "E404" */ 'page/404'))}
                      />
                      <Route
                        exact
                        path="/project/exception/500"
                        component={getComponentAsync(import(/* webpackChunkName: "E500" */ 'page/500'))}
                      />

                      <Redirect exact from="/" to="/online/product/list" />

                      <Route
                        component={getComponentAsync(import(/* webpackChunkName: "E404" */ 'page/404'))}
                      />
                    </Switch>
                  </App>
                )
                : <Route component={getComponentAsync(import(/* webpackChunkName: "Login" */ 'page/Login'))} />
            }
          </Switch>
        </React.Fragment>
      </HashRouter>
    </ConfigProvider>
  </Provider>
);

export default hot(module)(Root);
