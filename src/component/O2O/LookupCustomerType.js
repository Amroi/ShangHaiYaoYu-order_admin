import React from 'react';
import { Spin, Select, message } from 'antd';
import ajax from '../../util/api/ajax'; 

async function querySimpleCustomerTypeList() {
  const resp = await ajax({ url: '/erp/customer/type/list', method: "POST" });
  if(resp.success) {
    return resp
  } else {
    message.warn(resp.msg)
  }
}

export default class LookupCustomerType extends React.Component {
  constructor(props) {
    super(props);
    // 当前值
    this.state = {
      dataList: null,
    };
  }

  componentDidMount = () => {
    this.setState({ loading: true });
    querySimpleCustomerTypeList()
      .then(resp => resp.data)
      .then(dataList => (dataList ? this.setState({ dataList, loading: false }) : null));
  };

  handleValueChanged = (value, option) => {
    let selectOptions = new Array()
    for (let idx in option) {
      selectOptions.push(option[idx].props.item)
    }
    this.props.onChange ? this.props.onChange(selectOptions) : null;
  };

  render() {
    const { defaultVal } = this.props;
    const { dataList } = this.state;
    let ids = new Array();
    for (let idx in defaultVal) {
      ids.push(defaultVal[idx].id);
    }
    const options = dataList
      ? dataList.map(item => (
          <Select.Option item={item} key={item.id} value={item.id}>
            {item.name}
          </Select.Option>
        ))
      : null;
    return dataList ? (
      <Select
        mode='multiple'
        defaultValue={ids}
        placeholder='请选择...'
        onChange={this.handleValueChanged}
      >
        {options}
      </Select>
    ) : (
      <Spin />
    );
  }
}