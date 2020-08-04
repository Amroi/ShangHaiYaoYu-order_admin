import React from "react";
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Card,
  Table,
  Divider,
  Modal,
  Input,
  Button,
  InputNumber,
  message,
  Select,
  Tooltip,
  Tag,
  Drawer,
  Popconfirm,
  Row,
  Col,
  Form
} from "antd";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { SearchO2OProduct } from "../../component/O2O/LookupO2OProduct";

@withRouter
@inject("giftStore")
@observer
class PorductGift extends React.Component {
  state = {
    editVisible: false,
    editInfo: null,
  }

  componentDidMount = () => {
    let params = { page: 1 };
    this.props.giftStore.fetch(params);
    this.props.giftStore.getCustomerTypeList();
  };

  componentWillUnmount() {
    this.setState({
      editVisible: false,
      editInfo: null,
    })
  }

  columns = [
    {
      title: "名称",
      dataIndex: "gift_name",
    },
    {
      title: "绑定商品",
      width: 260,
      dataIndex: "prod_name",
    },
    {
      title: "状态",
      width: 120,
      align: "center",
      dataIndex: "gift_status",
      render: (val) => val === 2 ? <Tag color="green">启用</Tag> : <Tag color="gray">停用</Tag>
    },
    {
      title: "类型",
      width: 120,
      align: "center",
      dataIndex: "gift_type",
      render: (val) => val === 2 ? <Tag color='cyan'>绑定商品</Tag> : <Tag color="geekblue">通用礼品</Tag>
    },
    {
      title: "更新人",
      align: "center",
      width: 120,
      dataIndex: "updater",
    },
    {
      title: "上次更新时间",
      align: "center",
      width: 120,
      dataIndex: "update_at",
    },
    {
      title: "创建人",
      align: "center",
      width: 120,
      dataIndex: "creator",
    },
    {
      title: "创建时间",
      align: "center",
      width: 120,
      dataIndex: "create_at",
    },
    {
      title: "操作",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => <span>
        <a onClick={() => this.props.giftStore.toEditor('edit', record.id)}>编辑</a>
        <Divider type="vertical" />
        <Popconfirm
          title="确认删除该礼品信息吗？"
          onConfirm={() => this.props.giftStore.removeGiftInfo(record.id)}
          okText="确认"
          cancelText="取消"
        >
          <a href="#">删除</a>
        </Popconfirm>
      </span>
    }
  ]


  render() {
    const { dataList, total, editVisible, editData, changeEditVisible, loading, page, pageSize, onPageChange, fetch, filter, customerTypeList, handleSubmit, toEditor } = this.props.giftStore;
    return <div>
      <Card title="礼品管理">
        <SearchCondition loading={loading} handleSeach={fetch} />
      </Card>
      <Card>
        <Button onClick={() => toEditor("add")} loading={loading} type="primary" style={{ marginBottom: ".5rem" }}>新增</Button>
        <Table
          scroll={{ x: 1500 }}
          rowKey="id"
          columns={this.columns}
          loading={loading}
          dataSource={dataList}
          pagination={{ current: page, pageSize, total, onChange: onPageChange }}>
        </Table>
      </Card>
      {editVisible ? <GiftEditor
        handleSubmit={handleSubmit}
        customerTypeList={customerTypeList}
        loading={loading}
        data={editData}
        visible={editVisible}
        customerTypeList={customerTypeList}
        onCancel={changeEditVisible} /> : null}
    </div>
  }
}

// 礼品管理的查询大栏
class SearchCondition extends React.PureComponent {
  formRef = React.createRef();
  formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };
  handleSeach = values => {
    // e.preventDefault();
    // const values = await this.formRef.current.validateFields();
    values.page = 1;
    this.props.handleSeach(values);
   
      // let hasConditon = false;
      // Object.keys(values).forEach(function(key) {
      //   if (values[key]) {
      //     hasConditon = true;
      //   }
      // });
      // if (!hasConditon) {
      //   return;
      // }
     
   
  }
  render() {
    const { loading } = this.props;
    // const { getFieldDecorator } = this.props.form;
    return <Form ref={this.formRef} {...this.formItemLayout} onFinish={this.handleSeach}>
      <Row gutter={8}>
        <Col span={6} style={{ textAlign: 'left' }}>
          <Form.Item label='名&nbsp;&nbsp;称' name="gift_name">
          <Input autoComplete='off' placeholder="名称" />
            {/* {getFieldDecorator("gift_name")(<Input autoComplete='off' placeholder="名称" />)} */}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}  loading={loading}> 查询 </Button>
        </Col>
      </Row>
    </Form>
  }
}

// 礼品编辑抽屉
class GiftEditor extends React.PureComponent {
  formRef = React.createRef();
  state = {
    giftList: [],
    mainProdList: [],
    sku: '',
    prodName: '',
    isEdit: true,
    giftType: 2,
    gift_status : 2,
    initialVal:{
      id : '0',
      gift_status : 2,
      target_qty : 1 ,
      target_money : 1
    }
  };
   
  
  componentDidMount = () => {
   
    // this.formRef.current.setFieldsValue({
    //   ...this.props.data,
    // });
    
    let sku = '0';
    let prod_name = '';
    if (this.props.data) {
      sku = this.props.data.sku;
      prod_name = this.props.data.prod_name;
      
    }
    // let customer_id_list = '';

    // let customerTypeList = this.formRef.current.getFieldValue("customer_id_list");
    let customerTypeList = this.props.data ? this.props.data.customer_id_list : '';
   
    let list = [];
    if (customerTypeList) {
      const arr =  customerTypeList.split(",");
      
      for (let idx in arr) {
        let str = arr[idx].substring(1, arr[idx].length-1);
        if (isNaN(Number(str))) {
          continue;
        }
        list.push(Number(str));
       
      }
    }
   
    this.setState({
      initialVal : {
        ...this.props.data,
        customer_id_list : list
      }
    })

    // this.formRef.current.setFieldsValue({
    //   customer_id_list: list,
    // });

    const { mainProdList } = this.state;
    if (sku && prod_name) {
      mainProdList.push({
        sku: sku,
        prod_name: prod_name,
      })
    }
    this.setState({
      giftList: this.props.data ? this.props.data.gift_list : [],
      sku: sku,
      prodName: prod_name,
      isEdit: sku && prod_name,
      mainProdList: mainProdList,
      giftType: this.props.data ? this.props.data.gift_type : 2,
     

    });

    if (mainProdList.length === 0) {
      this.addMainProd(sku, prod_name);
    }
  };
  mainProdColumns = [
    {
      title: "商品",
      dataIndex: "prod_name",
      width: '90%',
      render: (val, record, idx) => {
        return <SearchO2OProduct
          editStatus={'edit'}
          value={val}
          id={record.sku}
          onSelect={(r) => this.handleSelectMainProduct(record, r, idx)} />
      }
    },
    {
      title: "操作",
      align: "center",
      render: (val, record, idx) => (
        <a onClick={() => this.removeMainProd(idx)}> X </a>
      )
    }
  ];

  giftColumns = [
    {
      title: "礼品",
      dataIndex: "prod_name",
      width: 520,
      render: (val, record, idx) => {
        return <SearchO2OProduct
          editStatus={'edit'}
          value={val}
          id={record.sku}
          onSelect={(r) => this.handleSelectProduct(record, r, idx)} />
      }
    },
    {
      title: <span>赠送比例<Tooltip placement="top" title="即购买一个绑定的商品赠送多少个该商品"><InfoCircleOutlined style={{ padding: '.3rem' }} /></Tooltip></span>,
      align: 'center',
      width : 220,
      dataIndex: "proportion",
      render: (_, record) => { return <InputNumber min={1} defaultValue={record.proportion} formatter={value => (isNaN(value)) ? 1 : Math.floor(value)} onChange={(proportion) => record.proportion = proportion} /> }
    },
    {
      title: "操作",
      align: "center",
      width : 120,
      render: (val, record, idx) => (
        <a onClick={() => this.removeGift(idx)}> X </a>
      )
    }
  ]

  handleSelectMainProduct = (record, product, idx) => {
    const { mainProdList } = this.state;
    for (let idx in mainProdList) {
      if (product.id === mainProdList[idx].sku) {
        message.warn('该商品已经选择');
        return;
      }
    }
    record.sku = product.id;
    record.prod_name = product.display_name;
    mainProdList[idx] = record;
    let newList = [...mainProdList];
    this.setState({
      mainProdList: newList,
    })
  }

  removeMainProd = (idx) => {
    const { mainProdList } = this.state;
    if (mainProdList.length < 2) {
      message.destroy();
      message.warn('删除失败，至少需要保留一个主商品');
      return;
    }
    let newList = [...mainProdList];
    newList.splice(idx, 1);
    this.setState({
      mainProdList: newList,
    });
  }

  handleSelectProduct = (record, product, idx) => {
    const { giftList, mainProdList, giftType } = this.state;
    if (mainProdList.length < 1) {
      message.destroy();
      message.warn('请先选择绑定的商品');
      return;
    }
    if (giftType === 2) {
      for (let idx in mainProdList) {
        if (product.id === mainProdList[idx].sku) {
          message.destroy();
          message.warn("赠送礼品不能与绑定的商品相同");
          return;
        }
      }
    }
    for (let idx in giftList) {
      if (giftList[idx].sku === product.id) {
        message.destroy();
        message.warn("此sku已存在");
        return;
      }
    }
    record.sku = product.id;
    record.prod_name = product.display_name;
    giftList[idx] = record;
    let newGiftList = [...giftList];
    this.setState({
      giftList: newGiftList,
    })
  };

  addMainProd = (sku, prodName) => {
    const { mainProdList } = this.state;
    let newProd = {
      id: new Date().getTime() + "",
      sku: sku,
      prod_name: prodName,
    }
    let newList = mainProdList.concat(newProd);
    this.setState({
      mainProdList: newList,
    })
  }

  addGift = () => {
    const { giftList } = this.state;
    let newProd = {
      id: new Date().getTime() + "",
      sku: "0",
      mid: "0",
      prod_name: "请选择",
      proportion: 1,
    }
    let newGiftList = giftList.concat(newProd);
    this.setState({
      giftList: newGiftList,
    })
  };

  removeGift = (idx) => {
    const { giftList } = this.state;
    let newGiftList = [...giftList];
    newGiftList.splice(idx, 1);
    this.setState({
      giftList: newGiftList,
    });
  };

  handleSubmit = () => {
    // const values = await this.formRef.current.validateFields();
   
    this.formRef.current.validateFields().then(values => {
    
    const { giftList, mainProdList, giftType } = this.state;
    if (giftType === 2 && !mainProdList && mainProdList.length === 0) {
      message.destroy();
      message.warn('请至少选择一个主商品');
      return;
    }
    if (giftType === 2) {
      for (let idx in mainProdList) {
        if (!mainProdList[idx] || !mainProdList[idx].sku || mainProdList[idx].sku === "0") {
          message.destroy();
          message.warn("主商品存在未选择的的行，请删除或添加");
          return;
        }
      }
    }
    
    if (!values.gift_name) {
      message.destroy();
      message.warn("名称不能为空");
      return;
    }
    if (!values.target_qty || values.target_qty <= 0) {
      message.destroy();
      message.warn('目标数量不能小于 0');
      return;
    }
    if (!values.target_money || values.target_money <= 0) {
      message.destroy();
      message.warn('目标金额不能小于 0');
      return;
    }
    // if (!values.sku) {
    //   message.warn("请选择绑定的商品");
    //   return;
    // }
    if (!values.customer_id_list || values.customer_id_list.length === 0) {
      message.destroy();
      message.warn("请选择赠送的客户类型");
      return;
    }
    if (!giftList || giftList.length === 0) {
      message.destroy();
      message.warn("请选择赠送的礼品");
      return;
    }
    // 客户类型数据处理
    let customer_id_list = ""
    for (let idx in values.customer_id_list) {
      if (idx == values.customer_id_list.length - 1) {
        customer_id_list += ':' + values.customer_id_list[idx] + ':';
      } else {
        customer_id_list += ':' + values.customer_id_list[idx] + ':,';
      }
    }
    values.customer_id_list = customer_id_list;
    
    // 礼品数据处理
    for (let idx in giftList) {
      if (!giftList[idx] || giftList[idx].sku === "0") {
        message.destroy();
        message.warn("存在未选择的礼品的行，请删除该行或选择礼品");
        return;
      }
    }
    values.main_prod_list = mainProdList;
    values.sku = mainProdList[0].sku;
    values.prod_name = mainProdList[0].prod_name;
    values.gift_list = giftList;
    this.props.handleSubmit(values);
  })
  };

  render() {
    const { loading, visible, onCancel, customerTypeList } = this.props;
    // const { getFieldDecorator } = form;
    const { giftList, mainProdList, isEdit, giftType ,gift_status} = this.state;
    
    return (
      <Drawer title={<Button loading={loading} onClick={() => this.handleSubmit()} type="primary">提交</Button>} width="60%" visible={visible} onClose={() => onCancel(false)}>
        <div>
          <Form layout="inline" ref={this.formRef} initialValues={this.state.initialVal}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label="名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称"  name="gift_name"   style={{ width : '100%' }} labelCol={{ span: 6 }} wrapperCol={{ span: 22 }} >
                <Input />
                  {/* {getFieldDecorator('gift_name', { initialValue: form.getFieldValue("gift_name") })(<Input />)} */}
                </Form.Item>
              </Col>

              <Form.Item style={{ display: 'none' }} name="id" initialValue='0' >
                <i></i>
                {/* {getFieldDecorator("id", { initialValue: form.getFieldValue("id") || '0' })(<i></i>)} */}
                </Form.Item>
              <Form.Item style={{ display: 'none' }} name="version">
                <i></i>
                {/* {getFieldDecorator("version")(<i></i>)} */}
                </Form.Item>
              <Col span={12} style={{marginTop: 10}}>
                <Form.Item label="礼品类型" name="gift_type" initialValue={ giftType } style={{ width: '100%' }} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                    <Select onSelect={e => { this.setState({ giftType: e })}}>
                      <Select.Option key={1} value={1}>适用全部商品</Select.Option>
                      <Select.Option key={2} value={2}>指定商品</Select.Option>
                    </Select>
                  {/* {getFieldDecorator("gift_type", { initialValue: giftType })(
                    <Select onSelect={e => { this.setState({ giftType: e })}}>
                      <Select.Option key={1} value={1}>适用全部商品</Select.Option>
                      <Select.Option key={2} value={2}>指定商品</Select.Option>
                    </Select>
                  )} */}
                </Form.Item>
              </Col>
              <Col span={12} style={{marginTop: 10}}>
                <Form.Item label="是否启用" name="gift_status" initialValue={gift_status} style={{ width: '100%'}}  labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                    <Select>
                      <Select.Option key={2} value={2}>启用</Select.Option>
                      <Select.Option key={1} value={1}>停用</Select.Option>
                    </Select>
                  {/* {getFieldDecorator("gift_status", { initialValue: form.getFieldValue("gift_status") || 2 })(
                    <Select>
                      <Select.Option key={2} value={2}>启用</Select.Option>
                      <Select.Option key={1} value={1}>停用</Select.Option>
                    </Select>
                  )} */}
                </Form.Item>
              </Col>
              <Col span={12} style={{marginTop: 10}}>
                <Form.Item label="达成数量" name="target_qty" style={{ width: '100%'}} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <InputNumber style={{ width: "100%" }} min={1} formatter={value => (isNaN(value)) ? 1 : Math.floor(value)} />
                  {/* {getFieldDecorator("target_qty", { initialValue: form.getFieldValue("target_qty") || 1 })(
                    <InputNumber style={{ width: "100%" }} min={1} formatter={value => (isNaN(value)) ? 1 : Math.floor(value)} />)} */}
                </Form.Item>
              </Col>
              <Col span={12} style={{marginTop: 10}}>
                <Form.Item label="达成金额" name="target_money" style={{ width: '100%' }} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <InputNumber style={{ width: "100%" }} min={0} />
                  {/* {getFieldDecorator("target_money", { initialValue: form.getFieldValue("target_money") || 1 })(
                    <InputNumber style={{ width: "100%" }} min={0} />)} */}
                </Form.Item>
              </Col>
            <Col span={24}>
              <Form.Item label="客户类型" name="customer_id_list" style={{ width: '100%', marginTop: 10, marginBottom: 10}} labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                <Select
                  mode="multiple" placeholder="请选择客户类型">
                  {customerTypeList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                </Select>
                {/* {getFieldDecorator("customer_id_list")(<Select
                  mode="multiple" placeholder="请选择客户类型">
                  {customerTypeList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                </Select>)} */}
              </Form.Item>
            </Col>
            {giftType == 2 ? <Col span={24} style={{marginTop: 10}}>
              <Form.Item label="绑定商品" style={{ width: '100%' }} labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                <Table rowKey="id" showHeader={false} columns={this.mainProdColumns} dataSource={mainProdList} pagination={false} />
                {!isEdit && <Button style={{ flex: 1, justifySelf: 'center', width: "100%" }} onClick={() => this.addMainProd('', '')}>增行</Button>}
              </Form.Item>
              </Col> : null }

              <Divider>选择礼品</Divider>
              <Table rowKey="id" columns={this.giftColumns} dataSource={giftList} pagination={false} />
              <Button style={{  justifySelf: 'center', width: "100%" }} onClick={() => this.addGift()}>增行</Button>
            </Row>
          </Form>
        </div>
      </Drawer>)
  }
}
export default PorductGift;