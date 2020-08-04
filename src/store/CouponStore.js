import { observable, action } from "mobx";
import ajax from "../util/api/ajax";
import { stringify } from "qs";
import { message } from "antd";

class CouponStore {
  @observable editVisible = false;

  @observable page = 1;
  @observable pageSize = 10;
  @observable total = 0;
  @observable loading = false;
  @observable dataList = [];
  @observable editEntity = null;

  filter = {
    page: this.page,
    pageSize: this.pageSize,
  };

  // 删除
  @action
  deleteCoupon = async (id) => {
    this.loading = true;
    try {
      const resp = await ajax({ url: "/erp/o2o/coupon/delete/" + id, method: "DELETE" });
      if (resp) {
        if (resp.success) {
          message.success(resp.msg);
          // 重新获取页面数据
          this.fetch(this.filter);
        } else {
          message.error(resp.msg);
        }
      }
    } finally {
      this.loading = false;
    }
  }

  // 新增或更新
  @action
  addOrUpdateCoupon = async (params) => {
    this.loading = true;
    try {
      let resp;
      if (params.id && params.id !== "0") {
        resp = await ajax({ url: "/erp/o2o/coupon/update", method: "POST", data: params });
      } else {
        resp = await ajax({ url: "/erp/o2o/coupon/add", method: "POST", data: params });
      }
      if (resp) {
        if (resp.success) {
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

  // 获取列表数据
  @action
  fetch = async (params) => {
    this.filter = {
      ...this.filter,
      ...params,
    }
    this.loading = true;
    try {
      const resp = await ajax({ url: "/erp/o2o/coupon/list?" + stringify(this.filter) });
      if (resp && resp.success) {
        this.page = this.filter.page;
        this.pageSize = this.filter.pageSize;
        this.dataList = resp.data;
        this.total = resp.total;
      }
    } finally {
      this.loading = false;
    }
  }

  changeEditVisible = (status) => {
    this.editVisible = status;
    if (!status) {
      this.editEntity = null;
    }
  };

  handleEdit = (record) => {
    this.editEntity = record;
    this.changeEditVisible(true);
  }
}


export default CouponStore;