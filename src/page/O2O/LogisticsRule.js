import React from "react";
import { InfoCircleOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
import { Modal, InputNumber, Input, message, Tooltip, Form } from "antd";
import ajax from "../../util/api/ajax";
import { SelectProduct } from "../../component/PopupProduct";

// 运费规则设置
class LogisticsRule extends React.Component {

  state = {
    visible: false,
    loading: false,
    sku: "",
    sku_name: "",
    target_money: 0,
    target_qty: 0,
    lowest_price: 0,
    cost: 0,
  }

  componentDidMount = async () => {
    const resp = await ajax({ url: "/erp/o2o/logistic/cost/rule/info" });
    if (resp && resp.success) {
      this.setState({ visible: true, loading: false, ...resp.data });
    } else {
      message.warn("查询运费规则失败，请刷新页面或联系 IT 人员");
    }
  }

  handleSubmit = async () => {
    const { target_money, target_qty, cost, sku, sku_name, version, lowest_price } = this.state;
    if (target_money < 0 || target_qty < 0 || cost < 0) {
      message.warn("金额/数量/运费不能小于 0");
      return;
    }
    if (!sku) {
      message.warn("请选择运费产品的 SKU");
      return;
    }
    try {
      this.setState({ loading: true });
      let params = {
        target_money, target_qty, cost, sku, version, sku_name, lowest_price
      };
      let method = "";
      if (version) {
        method = "update";
      } else {
        method = "add";
      }
      const resp = await ajax({ url: "/erp/o2o/logistic/cost/rule/" + method, method: "POST", data: params });
      if (resp && resp.success) {
        message.success(resp.msg);
        window.history.back(-1);
      } else if (!resp.success) {
        message.error(resp.msg);
      }
    } finally {
      this.setState({
        loading: false,
      })
    }
  }
  render() {
    const { visible, target_money, target_qty, lowest_price, cost, sku, sku_name, loading } = this.state;
    return (
      <Modal
        confirmLoading={loading}
        title={<span>运费免邮规则<Tooltip placement="top" title="只要达到指定的金额或数量即可免除运费，否则按照制定的运费收费。"><InfoCircleOutlined style={{ marginLeft: 10, paddingTop: 10 }} /></Tooltip></span>}
        visible={visible}
        okText="提交"
        onOk={this.handleSubmit}
        onCancel={() => window.history.back(-1)}>
        <Form layout='vertical'>
          <Form.Item required label={<span> 运费商品 SKU
            <Tooltip placement="right" title="请绑定 ERP 系统的运费虚拟产品。"><InfoCircleOutlined style={{ marginLeft: 5 }} /></Tooltip></span>}>
            <SelectProduct product={{ id: sku, name: sku_name }}
              onSelect={(product) => {
                this.setState({ sku: product.id, sku_name: product.name, })
              }} />
          </Form.Item>
          <Form.Item required label="免邮金额" >
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} defaultValue={target_money} onChange={(e) => this.setState({ target_money: e })} />
          </Form.Item>
          <Form.Item required label="免邮数量">
            <InputNumber min={0} style={{ width: '100%' }} defaultValue={target_qty} formatter={value => (isNaN(value)) ? 0 : Math.floor(value)} onChange={(e) => this.setState({ target_qty: Math.floor(e) })} />
          </Form.Item>
          <Form.Item label={<span>最低计数单价<Tooltip placement="top" title="e.g. 如果设置了 800，那么只有商品的单价大于等于 800 才会算入免邮数量的统计"><InfoCircleOutlined style={{ marginLeft: 5 }} /></Tooltip></span>}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} defaultValue={lowest_price} onChange={(e) => this.setState({ lowest_price: e })} />
          </Form.Item>
          <Form.Item required label="默认运费">
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} defaultValue={cost} onChange={(e) => this.setState({ cost: e })} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default LogisticsRule;