/**
 * @name 请求API代理
 * @author gongzhen
 * @param options
 * @param 参数详解：https://github.com/axios/axios
 * @since 2020-04-06
 */
import axios from 'axios';
import errorHint from './errorHint';
import { message } from 'antd';

// 默认配置
axios.defaults.method = 'get';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 60 * 1000;

// 添加请求拦截器
axios.interceptors.request.use((config) => {
  if (process.env.API === 'dev') {
    config.url = `${config.url}`;
  }

  if (config.postForm) {
    config.headers.common['Content-Type'] = 'application/www-url-encode';
  } else {
    config.headers.common['Content-Type'] = 'application/json';
  }
  let microIdx = config.url.indexOf('.');
  if (config.url.indexOf('?') > -1) {
    microIdx = -1
  }
  // 调用微服务
  if (microIdx > -1) {
    config.headers.common['X-RPCX-ServiceMethod'] = config.url.substring(microIdx + 1);;
    config.headers.common['X-RPCX-MesssageType'] = '1';
    config.headers.common['X-RPCX-SerializeType'] = '1';

    config.headers.common['X-RPCX-ServicePath'] = config.url.substring(0, microIdx);
    config.url = "/zksoft-micro"
  }
  config.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("access_token");
  return config;
});

const request = (options, resolve) => axios({ ...options }).then((resp) => {
  const data = resp.data || {};
  // if (resp.headers && resp.headers.filename) {
  //   data.filename = resp.headers.filename;
  // }
  resolve(data);
  if (resp.status !== 200) {
    errorHint.push(data.msg);
  }
}).catch((err) => {
  const data = {
    status: false,
    success: false,
    data: [],
    msg: `请求失败`
  };
  resolve(data);
  if (err.response.status == 401) {
    window._routers.replace("/login");
  } else if (err.response.status == 404) {
    message.warn("请求资源不存在")
  } else if (err.response.status === 403) {
    message.destroy();
    if (err.response.data) {
      message.warn(err.response.data.msg);
    } else {
      message.warn('无权访问')
    }
  }

});

const ajax = options => new Promise(resolve => request(options, resolve));

export default ajax;
