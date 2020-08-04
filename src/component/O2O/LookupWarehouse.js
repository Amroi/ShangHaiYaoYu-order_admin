import React from 'react';
import { Spin, Select, message } from 'antd';
import ajax from '../../util/api/ajax'; 

async function queryWarehouseList() {
  const resp = await ajax({ url: '/erp/o2o/wh/list', method: 'get' });
  if(resp.success) {
    return resp
  } else {
    message.warn(resp.msg)
  }
}

export default class LookupWarehouse extends React.Component {
  constructor(props) {
    super(props);
    // 当前值
    this.state = {
      value: props.value ? props.value : '',
      loading: false,
      dataList: null,
    };
  }

  componentDidMount = () => {
     this.handleSearch(0);
    
  };

  handleSearch = value => {
    this.setState({ loading: true });
    queryWarehouseList({ name: value })
      .then(resp => resp.data)
      .then(dataList => (this.setState({ dataList: dataList ? dataList : [], loading: false })));
  };

  handleValueChanged = (value, option) => {
    this.props.onChange ? this.props.onChange(option.props.item) : null;
    this.props.onSelect ? this.props.onSelect(value, option.props.item) : null;
  };

  render() {
    const { dataList, loading } = this.state;
    const options = dataList ? dataList.map(item => (
          <Select.Option item={item} key={item.id} value={item.id}>
            {item.name}
          </Select.Option>
        ))
      : null;
    return dataList ? (
      <Select
        style={{ minWidth: 200 }}
        defaultValue={this.state.value}
        showSearch
        allowClear
        notFoundContent={ loading ? <Spin size="small" /> : null}
        filterOption={(inputValue, option) => {
          return option.props.children.indexOf(inputValue) !== -1;
        }}
        onSearch={this.handleSearch}
        onSelect={this.handleValueChanged}
      >
        {options}
      </Select>
    ) : (
      <Spin />
    );
  }
}