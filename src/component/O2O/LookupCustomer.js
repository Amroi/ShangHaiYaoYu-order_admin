import React from 'react';
import { Spin, Select, message } from 'antd';
import { stringify } from 'qs';
import ajax from '../../util/api/ajax';

async function querySimpleCustomerList(params) {
  const resp = await ajax({ url: '/erp/customer/list?' + stringify(params), method: 'get' });
  if (resp.success) {
    return resp
  } else {
    message.warn(resp.msg)
  }
}

export default class LookupCustomer extends React.Component {
  constructor(props) {
    super(props);
    // 当前值
    this.state = {
      value: props.value ? props.value : '',
      loading: false,
      dataList: null,
      key: props.lookupKey ? props.lookupKey : 'id',
    };
     
  }
  
  componentDidMount = () => {
    this.setState({ loading: true });
    querySimpleCustomerList({ id: this.props.defaultId })
      .then(resp => resp.data)
      .then(dataList => (dataList ? this.setState({ dataList, loading: false }) : null));
  };

  handleSearch = value => {
     if(this._t) {
       clearTimeout(this._t);
     }
    this._t = setTimeout(()=> {
      this.setState({ loading: true });
      querySimpleCustomerList({ name: value })
        .then(resp => resp.data)
        .then(dataList => (dataList ? this.setState({ dataList, loading: false }) : null));
     }, 500);
  };

  handleValueChanged = (value, option) => {
    this.props.onChange ? option ? this.props.onChange(option.props.item) : this.props.onChange() : null;
  };

  render() {
    const { dataList, loading } = this.state;
    const { defaultId, width } = this.props;
    let defaultValue = '';
    if (dataList && dataList.length >= 0) {
      for (var item in dataList) {
        if (dataList[item].id == defaultId) {
          defaultValue = dataList[item].name;
          break;
        }
      }
    }
    const options = dataList
      ? dataList.map(item => (
        <Select.Option item={item} key={item.id} value={item[this.state.key]}>
          {item.name}
        </Select.Option>
      ))
      : null;
    return dataList ? (
      <Select
        defaultValue={defaultValue}
        showSearch
        allowClear
        style={{ minWidth: 180, width: width ? width : 0 }}
        notFoundContent={loading ? <Spin size="small" /> : null}
        filterOption={(inputValue, option) => {
          return option.props.children.indexOf(inputValue) !== -1;
        }}
        onSearch={this.handleSearch}
        onChange={this.handleValueChanged}
      >
        {options}
      </Select>
    ) : (
        <Spin />
      );
  }
}
