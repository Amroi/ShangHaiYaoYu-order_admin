import { observable, action } from "mobx";
import ajax from "../util/api/ajax";
import { message } from "antd";
import { stringify } from "qs";

class GiftStore {
  @observable dataList = [];
  @observable total = 0;
  @observable loading = false;
  @observable editVisible = false;
  @observable page = 1;
  @observable pageSize = 10;
  @observable editData = null;
  @observable customerTypeList = [];

  filter = { page: this.page, pageSize: this.pageSize };

  @action
  toEditor = async(operation, id) => {
    if (operation === 'add') {
      this.changeEditVisible(true);
    } else if (operation === 'edit') {
      const resp = await ajax({ url: '/erp/o2o/gift/detail/' + id});
      if (resp) {
        if (resp.success) {
          this.changeEditVisible(true, resp.data);
        } else {
          message.destroy();
          message.warn(resp.msg);
        }
      }
    }
  }

  @action
  fetch = async(params) => {
    this.loading = true;
    try {
      const resp = await ajax({ url: '/erp/o2o/gift/list?'+stringify(params) });
      if (resp.success) {
          for (let idx in resp.data) {
            if (resp.data[idx].gift_content && resp.data[idx].gift_content !== "") {
              let giftList = JSON.parse(resp.data[idx].gift_content);
              resp.data[idx].gift_content = giftList;
            }
          }
          this.dataList = resp.data;
          this.total = resp.total;
          this.page = params.page;
          this.filter = { ...this.filter, ...params }
      } else {
          message.destroy();
          message.error(resp.msg)
      }
    } finally {
      this.loading = false;
    }
  }

  @action
  handleSubmit = async(params) => {
    this.loading = true;
    const method = params.id == '0' ? "add" : "update";
    try {
      const resp = await ajax({ url: "/erp/o2o/gift/" + method, method: "POST", data: params });
      if (resp) {
        if (resp.success) {
          message.destroy();
          message.success(resp.msg);
          this.changeEditVisible(false);
          this.fetch(this.filter);
        } else {
          message.destroy();
          message.error(resp.msg);
        }
      }
    } finally {
      this.loading = false;
    }
  }

  @action
  getCustomerTypeList = async() => {
    const resp = await ajax({ url: "/erp/customer/type/list", method: "POST" });
    if (resp && resp.success) {
      this.customerTypeList = resp.data;
    } else {
      message.destroy();
      message.warn("获取客户类型列表失败，请刷新");
    }
  }

  @action
  removeGiftInfo = async(id) => {
    if (id == 0) {
      message.destroy();
      message.warn("删除有误，请刷新页面重试");
      return;
    }
    this.loading = true;
    try {
      const resp = await ajax({ url: "/erp/o2o/gift/remove/" + id, method: "DELETE" });
      if (resp) {
        if (resp.success) {
          message.destroy();
          message.success(resp.msg);
          this.changeEditVisible(false);
          this.fetch(this.filter);
        } else {
          message.error(resp.msg);
        }
      }
    } finally {
      this.loading = false;
    }
  }

  onPageChange = (p) => {
    let params = { ...this.filter, page: p };
    this.fetch(params);
  }

  changeEditVisible = (status, data) => {
    this.editData = data ? data : null;
    this.editVisible = status;
  }

}

export default GiftStore;