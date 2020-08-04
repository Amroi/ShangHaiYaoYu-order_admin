import React from 'react';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Table, Select, Input, Button, Form } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ajax from '../../util/api/ajax';
import { stringify } from 'qs';

class ProdListModal extends React.PureComponent {
  state = {
    loading: false,
    dataList: [],
    page: 1,
    pageSize: 10,
    reqParams: {},
    total: 0,
    prodType: 0,
    prodTypeList: [],
    name: '',
    code: '',
  };

  columns = [
    {
      title: '编码',
      dataIndex: 'product_code',
      align: 'center',
      width: '15%',
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: '50%',
    },
    {
      title: '颜色',
      dataIndex: 'color',
    },
    {
      title: '操作',
      render: (_, record) => <a onClick={() => this.handleSelect(record)}>选择</a>
    },
  ];

  handleSelect = (prod) => {
    this.props.handleSelect(prod);
  }

  queryProdTypeList = async () => {
    const resp = await ajax({ url: `/erp/product/type/list` });
    if (resp && resp.success) {
      this.setState({
        prodTypeList: resp.data,
      })
    }
  };

  queryProdList = async (param) => {
    const { reqParams, prodType, code, name } = this.state;
    let params = {
      ...reqParams,
      product_type_list: prodType,
      code: code,
      name: name,
      status: 1,
      ...param,
    };
    if (!params.page) {
      params.page = 1;
    }
    if (!params.page_size || params.page_size < 10 || params.page_size > 100) {
      params.page_size = 10;
    }
    try {
      this.setState({
        loading: true,
      })
      const resp = await ajax({ url: `/erp/product/sku/list?` + stringify(params) });
      if (resp && resp.success) {
        this.setState({
          dataList: resp.data,
          total: resp.total,
          ...param,
        });
      }
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  componentDidMount() {
    this.queryProdTypeList();
    this.queryProdList();
  };

  componentWillUnmount() {
    this.setState({
      loading: false,
      dataList: [],
      page: 1,
      pageSize: 10,
      reqParams: {},
      total: 0,
      prodType: 0,
      prodTypeList: [],
      name: '',
      code: '',
    })
  };

  onPageChange = (page) => {
    let param = { page: page };
    this.queryProdList(param);
  }
//荣耀畅玩7移动版
  render() {
    const { dataList, loading, page, pageSize, total, prodTypeList } = this.state;
    const { visible, onClose } = this.props;
    let typeList = [ <Select.Option value='0'>全部</Select.Option> ];
    prodTypeList && prodTypeList.map(item => typeList.push(<Select.Option value={item.id}>{item.name}</Select.Option>));
    // let typeList = prodTypeList ? prodTypeList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>) : [];
    return <div>
      <Modal visible={visible} confirmLoading={loading} onCancel={onClose} width={780}>
        <form>
          <Select defaultValue='0' onSelect={(v) => this.setState({ prodType: v })} style={{ width: 140 }}>
            {typeList}
          </Select>
          <Input placeholder='编码' style={{ marginLeft: 10, width: 140 }} onChange={e => this.setState({ code: e.target.value })} />
          <Input placeholder='商品名称/拼音' style={{ marginLeft: 10, width: 280 }} onChange={e => this.setState({ name: e.target.value, pinYin: e.target.value })} />
          <Button style={{ marginLeft: 10 }} type='primary' htmlType='submit' onClick={() => this.queryProdList()} loading={loading} icon={<SearchOutlined />}>查询</Button>
        </form>
        <Table rowKey='id' dataSource={dataList} columns={this.columns} style={{ marginTop: 10 }} loading={loading} pagination={{
          current: page,
          page_size: pageSize,
          total: total,
          onChange: this.onPageChange
        }} />
      </Modal>
    </div>
  }
}

class LookupProdWithSku extends React.PureComponent {
  state = {
    visible: false,
    prodName: '',
    prodId : 0,
  }
  changeVisible = (val) => {
    this.setState({
      visible: val,
    });
  };
  handleSelect = (prodInfo) => {
    this.setState({
      visible: false,
      prodId: prodInfo.id,
      prodName: prodInfo.name,
    })
    this.props.onSelect(prodInfo);
  }

  render() {
    const { visible, prodName, prodId } = this.state;
    const { showName, defaultVal } = this.props;
    return <div>
      <Input.Search value={showName ? prodName ? prodName : (defaultVal || '') : prodId > 0 ? prodId : (defaultVal || '') } readOnly onSearch={() => this.changeVisible(true)} />
      {visible && <ProdListModal visible={visible} onClose={() => this.changeVisible(false)} handleSelect={this.handleSelect} />}
    </div>
  }
}

export default LookupProdWithSku;