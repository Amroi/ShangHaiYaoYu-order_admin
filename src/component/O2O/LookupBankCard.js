import React from 'react';
import { Select, Spin } from 'antd';
import ajax from '../../util/api/ajax';

export default class LookupBankCard extends React.Component {
  constructor(props) {
    super(props);
    // 当前值
    this.state = {
      value: props.value ,
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

    const data = sessionStorage.getItem('o2o_bank_card_list');
    if (!data || data.length == 0) {
      this.setState({ loading: true });
        const resp = ajax({ url: '/erp/o2o/bank/list', method: 'get' })
        return resp
        .then(resp => resp.data)
        .then(dataList =>
          dataList
            ? this.setState({ dataList, loading: false }, () => {
                this.canUpdate = false;
                sessionStorage.setItem('o2o_bank_card_list', JSON.stringify(this.state.dataList));
              })
            : null
        );
    } else {
      this.setState({ dataList: JSON.parse(data), loading: false }, () => (this.canUpdate = false));
    }
  };

  handleValueChanged = (value, option) => { 
    if(!value) {
      this.props.onChange ? this.props.onChange(0) : null;
    }  else {
      this.props.onChange ? this.props.onChange(option.props.item) : null;
      this.props.onSelect ? this.props.onSelect(value, option.props.item) : null;
    }
    
  };

  render() {
    const { lookupProps } = this.props;
    const { dataList, loading, value } = this.state;
    const options = dataList.map(item => (
      <Select.Option label={item.bind_name} key={item.id} value={item.id} item={item}>
        {item.bind_name}
      </Select.Option>
    ));
    return (
      <Select
        style={{ minWidth: 200 }}
        allowClear
        showSearch
        onChange={this.handleValueChanged}
        defaultValue={value}
        filterOption={(inputValue, option) => {
          return option.props.children.indexOf(inputValue) !== -1;
        }}
        //  showSearch
        notFoundContent={loading ? <Spin /> : null}
        onSelect={this.handleValueChanged}
      >
        {options}
      </Select>
    );
  }
}
