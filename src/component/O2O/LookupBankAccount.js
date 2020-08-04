import React from 'react';
import { Select, Spin } from 'antd';
import ajax from '../../util/api/ajax';

export default class LookupBankAccount extends React.Component {
  constructor(props) {
    super(props);
    // 当前值
    this.state = {
      value: props.value,
      loading: false,
      dataList: [],
    };
  }
  componentDidMount() {
    this.handleFocus();
  }

  handleFocus = () => {
    if (this.state.dataList.length > 0) {
      return;
    }

    const data = sessionStorage.getItem('bank_list');
    if (!data || data.length == 0) {
      this.setState({ loading: true });
        const resp = ajax({ url: '/erp/o2o/erp/bank/list', method: 'get' })
        return resp
        .then(resp => resp.data)
        .then(dataList =>
          dataList
            ? this.setState({ dataList, loading: false }, () => {
                this.canUpdate = false;
                sessionStorage.setItem('bank_list', JSON.stringify(this.state.dataList));
              })
            : null
        );
    } else {
      this.setState({ dataList: JSON.parse(data), loading: false }, () => (this.canUpdate = false));
    }
  };

  handleValueChanged = (value, option) => {
    this.props.onChange ? this.props.onChange(option.props.item) : null;
    this.props.onSelect ? this.props.onSelect(value, option.props.item) : null;
  };

  render() {
    const { lookupProps } = this.props;
    const { dataList, loading, value } = this.state;
    const defaultValue = { key: value ? value.id : '0', label: value ? value.name : '' };
    const options = dataList.map(item => (
      <Select.Option label={item.name} key={item.id} item={item}>
        {item.name}
      </Select.Option>
    ));
    return (
      <Select
        style={{ minWidth: 200 }}
        allowClear
        defaultValue={defaultValue}
        filterOption={(inputValue, option) => {
          return option.props.children.indexOf(inputValue) !== -1;
        }}
        //  showSearch

        labelInValue
        notFoundContent={loading ? <Spin /> : null}
        onSelect={this.handleValueChanged}
      >
        {options}
      </Select>
    );
  }
}
