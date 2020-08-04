import React from "react";
import { withRouter } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Table,
  Card,
  Divider,
  Button,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Drawer,
  Popconfirm,
  message,
  Radio,
  Form
} from "antd";
import ajax from '../../util/api/ajax';
import moment from "moment";
import { SearchO2OProduct } from "../../component/O2O/LookupO2OProduct";
import { inject, observer } from "mobx-react";
import LookupCustomer from "../../component/O2O/LookupCustomer";

@withRouter
@inject("couponStore")
@observer
class CouponList extends React.Component {
  columns = [
    {
      title: "优惠券名称",
      width: 200,
      dataIndex: "name",
    },
    {
      title: "有效日期",
      align: "center",
      width: 220,
      render: record => {
        return (
          <span>{moment(record.start_at * 1000).format("YYYY-MM-DD")} ~ {moment(record.end_at * 1000).format("YYYY-MM-DD")}</span>
        )
      }
    },
    {
      title: "创建人",
      dataIndex: "creator",
      width: 160,
      align: "center",
    },
    {
      title: "创建日期",
      align: "center",
      width: 160,
      render: record => {
        return (
          <span>{moment(record.create_at * 1000).format("YYYY-MM-DD HH:mm:ss")}</span>
        )
      }
    },
    {
      title: "操作",
      align: "center",
      width: 120,
      fixed: "right",
      render: record => {
        return (
          <span>
            <a onClick={() => this.props.couponStore.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="是否确认删除吗？"
              onConfirm={() => this.props.couponStore.deleteCoupon(record.id)}
              okText="删除"
              cancelText="取消">
              <a href="#">删除</a>
            </Popconfirm>
          </span>
        )
      }
    }
  ];

  onPageChange = (p) => {
    params = { page: p }
    this.props.couponStore.fetch(params);
  };

  componentDidMount = () => {
    this.props.couponStore.fetch();
  }

  render() {
    const { editVisible, changeEditVisible, page, pageSize, total, loading, dataList, addOrUpdateCoupon, editEntity, fetch } = this.props.couponStore;
    return (
      <div>
        <Card title="优惠管理">
          <SearchCondition loading={loading} handleSubmit={fetch} />
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Button loading={loading} type='primary' style={{ marginBottom: 7 }} onClick={() => changeEditVisible(true)}>新建</Button>
          <Table loading={loading} rowKey="id" columns={this.columns} dataSource={dataList} scroll={{ x: 1500 }}
            pagination={{ current: page, pageSize: pageSize, total: total, onChange: this.onPageChange }} />
        </Card>
        {editVisible && <CouponEdit loading={loading} data={editEntity} visible={editVisible} handleCancel={() => changeEditVisible(false)} handleSubmit={addOrUpdateCoupon} />}
      </div>)
  }
}

// 优惠管理查询大栏
class SearchCondition extends React.PureComponent {
  formRef = React.createRef();

  state = {
    condition: {},
  };

  onSubmit = () => {
    // e.preventDefault();
    let params = this.state.condition;
    params.page = 1;
    this.props.handleSubmit(params);
  }

  render() {
    return (
      <Form onFinish={this.onSubmit} layout="inline" ref={this.formRef}>
        <Form.Item label="优惠券名称">
          <Input placeholder="请输入名称" onChange={(e) => this.setState({ condition: { ...this.state.condition, name: e.target.value } })} />
        </Form.Item>
        <Form.Item>
          <Button
            loading={this.props.loading}
            htmlType="submit"
            type="primary"
            icon={<SearchOutlined />}
          > 查询
              </Button>
        </Form.Item>
      </Form>
    );
  }
}

class CustomersDetail extends React.PureComponent {
  state = {
    customerList: [],
  };
  columns = [
    {
      title: '客户名称',
      dataIndex: 'customer_id',
      render: (val, record) => <LookupCustomer defaultId={record.bind_id} width={368} onChange={(customerInfo) => this.selectCustomer(customerInfo, record)} />
    },
    {
      title: "优惠金额",
      dataIndex: 'discount',
      render: (_, record) => { return <InputNumber defaultValue={record.discount} min={0} onChange={(val) => record.discount = val} /> }
    },
    {
      title: '操作',
      render: (_, record, idx) => (<a onClick={() => this.removeCustomer(idx)}>X</a>)
    }
  ];

  selectCustomer = (customerInfo, record) => {
    record.bind_id = customerInfo ? customerInfo.id : 0;
    record.bind_name = customerInfo ? customerInfo.name : '';
    this.props.handleChange(this.state.customerList);
  }

  componentDidMount = () => {
    const { dataList } = this.props;
    this.setState({
      customerList: (dataList && dataList.length > 0) ? dataList : [],
    });
    if (!dataList || dataList.length === 0) {
      this.addRow();
    }
  };

  removeCustomer = (idx) => {
    const { customerList } = this.state;
    let list = [...customerList];   // 框架的坑啊，全是 TM 的代理参数对象。
    list.splice(idx, 1);
    this.setState({
      customerList: list,
    });
    this.props.handleChange(list);
  }

  addRow = () => {
    const { customerList } = this.state;
    let rowInfo = {
      id: new Date().getTime().toString(),
      customer_id: 0,
      discount: 0,
    };
    let newList = customerList.concat(rowInfo);
    this.setState({
      customerList: newList,
    });
    this.props.handleChange(newList);
  };

  render() {
    const { customerList } = this.state;
    return <div>
      <Table columns={this.columns} dataSource={customerList} rowKey='id'>
      </Table>
      <Button style={{ flex: 1, justifySelf: 'center', width: "100%" }} onClick={() => this.addRow()}>增行</Button>
    </div>
  }
}

class OfferDetail extends React.PureComponent {
  state = {
    loading: false,
  };

  columns = [
    {
      title: "客户类型",
      dataIndex: "bind_name",
      width: 220,
    },
    {
      title: "优惠金额",
      render: (_, record) => { return <InputNumber defaultValue={record.discount} min={0} onChange={(val) => {record.discount = val}} /> },
      width: 100,
    },
    {
      title: "操作",
      align: "center",
      width: 80,
      render: (_, record, idx) => <a onClick={() => this.remove(idx)}> X </a>
    }
  ]

  componentDidMount = () => {
    if (!this.props.dataList || this.props.dataList.length === 0 || this.props.dataList[0].bind_id === "0") {
      this.getCustomerTypeList();
    }
  };

  remove = (idx) => {
    let list = [...this.props.dataList];
    list.splice(idx, 1);
    this.props.handleChange(list);
  }

  getCustomerTypeList = async () => {
    this.setState({
      loading: true,
    });
    try {
      const resp = await ajax({ url: "/erp/customer/type/list", method: "POST" });
      if (resp && resp.success) {
        let id = 0;
        let list = resp.data.map(item => {
          id += 1;
          return { id: id.toString(), bind_id: item.id.toString(), bind_name: item.name, discount: 0 }
        });
        this.props.handleChange(list);
      }
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { loading } = this.state;
    const { dataList } = this.props;
    return <div><Table rowKey="id" dataSource={dataList} loading={loading} columns={this.columns} />
      <Button loading={loading} style={{
        width: '100%',
        textAlign: "center",
        flex: 1, justifyContent: 'center'
      }} type='ghost' onClick={() => this.getCustomerTypeList()}>加载类型</Button>
    </div>
  }
}

class CouponEdit extends React.PureComponent {
  formRef = React.createRef();

  state = {
    editData: {
      discount: 1,
      release_type: 1, 
      kind: 1,
      offer_date: [moment(), moment().add(7, 'days')], status: 2, qty: 1
    },
  };

  componentDidMount = () => {
    if (this.props.data) {
      this.setState({
        editData: {
          ...this.props.data,
          offer_date: this.props.data.start_at ? [moment.unix(this.props.data.start_at), moment.unix(this.props.data.end_at)] : [moment(), moment().add(7, 'days')],
          kind: this.props.data.kind || 1,
          discount: this.props.data.list.length > 0 ? this.props.data.list[0].discount : 1,
          // lastList: this.props.data.list,
        }
      })
    }
  };

   onSubmit = () => {
    let data = { ...this.state.editData };
    if (data.list) {
      let detailList = [ ...data.list ];
      data.list = detailList;
    }
    if (!data.name) {
      message.warn("优惠券名称不能为空");
      return;
    }
    if (data.kind === 1) {
      if (!data.sku || data.sku === "0") {
        message.warn("请选择要优惠的 SKU");
        return;
      }
    } else {
      if (!data.target_val) {
        message.warn("请填写达成值");
        return;
      }
    }

    if (data.release_type === 1) {
      if (!data.discount) {
        message.warn("请填写优惠金额");
        return;
      }
    } else {
      let arr = new Array();
      for (let idx in data.list) {
        if (data.release_type === 3) {
          if (!data.list[idx].bind_id || data.list[idx].bind_id === '0') {
            message.destroy();
            if (data.list[idx].bind_name) {
              message.warn('指定客户[' + data.list[idx].bind_name + ']信息错误，请重新选择');
            } else {
              message.warn('指定用户信息存在错误，请重新编辑');
            }
            return;
          }
          if (arr.indexOf(data.list[idx].bind_id) > -1) {
            message.destroy();
            message.warn('存在相同的指定客户，请调整');
            return;
          }
          arr.push(data.list[idx].bind_id);
          if (!data.list[idx].discount) {
            message.destroy();
            message.warn("优惠金额不能小于 0");
            return;
          }
        }
      }
      if (data.release_type === 2) {
        let len = data.list.length;
        for (let i = len -1; i >= 0; i --) {
          if (!data.list[i].discount) {
            data.list.splice(i, 1);
          }
        }
      }
    }

    if (!data.offer_date || data.offer_date.length !== 2) {
      message.warn("请选择有效日期");
      return;
    }
    data.start_at = data.offer_date[0].unix();
    data.end_at = data.offer_date[1].unix();
    delete data.offer_date;

    this.props.handleSubmit(data);
  };

  changeCouponDetail = (list) => {
    this.setState({
      editData: {
        ...this.state.editData,
        list: list,
      }
    })
  };

  render() {
    const { visible, loading, handleCancel } = this.props;
    const { editData } = this.state;
    return <Drawer title={<Button loading={loading} onClick={() => this.onSubmit()} type="primary">提交</Button>} width={720} visible={visible} onClose={handleCancel}>
      <div>
        
      </div>
      <Form layout='horizontal' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} ref={this.formRef}>
        <Form.Item required label="优惠券名称">
          <Input defaultValue={editData && editData.name} onChange={(e) => this.setState({ editData: { ...editData, name: e.target.value } })} />
        </Form.Item>
        <Form.Item label="优惠券描述">
          <Input.TextArea defaultValue={editData && editData.description} autoSize={{ minRows: 3, maxRows: 6 }} onChange={(e) => { this.setState({ editData: { ...editData, description: e.target.value } }) }}></Input.TextArea>
        </Form.Item>
        <Form.Item label="有效日期" required>
          <DatePicker.RangePicker style={{ width: 547.5  }} defaultValue={editData.offer_date} onChange={(e) => { this.setState({ editData: { ...editData, offer_date: e } }) }} />
        </Form.Item>
        <Form.Item label="是否启用" required>
          <Radio.Group
            disabled={loading}
            defaultValue={editData.status}
            buttonStyle="solid"
            onChange={(e) => { this.setState({ editData: { ...editData, status: e.target.value } }) }}
          >
            <Radio.Button key={2} value={2}>启用</Radio.Button>
            <Radio.Button key={1} value={1}>停用</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="优惠类型" required>
          <Select defaultValue={editData.kind || 1} onChange={(val) => { this.setState({ editData: { ...editData, kind: val } }) }} style={{ width: 120 }}>
            <Select.Option key={1} value={1}>单个 SKU</Select.Option>
            <Select.Option key={2} value={2} disabled>订单总台数</Select.Option>
            <Select.Option key={3} value={3} disabled>订单总金额</Select.Option>
          </Select>
        </Form.Item>
        {editData.kind === 2 && <Form.Item label="达成台数" required>
          <InputNumber min={1} style={{ width: 120 }}
            onChange={(val) => { this.setState({ editData: { ...editData, target_val: val } }) }}
            defaultValue={editData && editData.target_val} />
        </Form.Item>}
        {editData.kind === 3 && <Form.Item label="达成金额" required>
          <InputNumber min={1} style={{ width: 120 }}
            onChange={(val) => { this.setState({ editData: { ...editData, target_val: val } }) }}
            defaultValue={editData && editData.target_val} />
        </Form.Item>}
        {editData.kind === 1 && <Form.Item required label="优惠 SKU">
          <SearchO2OProduct
            editStatus={'edit'}
            value={editData.product}
            id={editData.sku}
            onSelect={(r) => {
              this.setState({
                editData: {
                  ...editData,
                  product_id: r.erp_product.id,
                  product: r.display_name,
                  sku: r.id,
                }
              })
            }} />
        </Form.Item>}

        <Form.Item label="发放类型" required>
          <Select style={{ width: 120 }} defaultValue={editData.release_type || 1} onChange={(val) => { this.setState({ editData: { ...editData, release_type: val, list: [], discount: 1 } }) }}>
            <Select.Option key={1} value={1}>通用类型</Select.Option>
            <Select.Option key={2} value={2}>客户类型</Select.Option>
            <Select.Option key={3} value={3}>指定客户</Select.Option>
          </Select>
        </Form.Item>
        {editData.release_type === 1 && <Form.Item required label="优惠金额">
          <InputNumber min={1}
            style={{ width: 120 }}
            defaultValue={editData && editData.discount > 0 ? editData.discount : 1}
            onChange={(val) => { this.setState({ editData: { ...editData, discount: val } }) }} />
        </Form.Item>}
        {editData.release_type === 2 && <OfferDetail dataList={editData.list || null} handleChange={this.changeCouponDetail} />}
        {editData.release_type === 3 && <CustomersDetail dataList={editData.list || []} handleChange={this.changeCouponDetail} />}
      </Form>
    </Drawer>
  }
}

export default CouponList;