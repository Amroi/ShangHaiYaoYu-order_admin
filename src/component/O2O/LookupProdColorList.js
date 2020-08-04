import React from "react";
import { Select } from "antd";
import loginUtil from '../../util/login';
import ajax from '../../util/api/ajax';

const user = () => loginUtil.getUserInfo();

class LookupProdColorList extends React.PureComponent {
  state = {
    loading: false,
    color_list: [],
    product_id: "",
    value: [],
  };

  componentDidMount = () => {
    this.props.product_id && this.queryList(this.props.product_id, this.props.defaultValue);
  };

  componentDidUpdate(prevProps, prevState) {
    // 如果数据发生变化
    if(prevProps.product_id !== this.props.product_id) {
      this.setState({
        value: [],
      });
      this.handleValueChanged([]);
    }
  }

  queryList = async (id, defaultValue) => {
    if (!id || this.state.product_id === id) {
      return;
    }
    try {
      const resp = await ajax({ url: `/erp/product/product_color/list?id=${id}&company_id=${user().company.id}`, method: 'get' })
      if (resp.success) {
        this.setState({
          color_list: resp.data,
          product_id: id,
        })
      };
    } finally {
      this.setState({
        loading: false,
        value: defaultValue ? defaultValue : [],
      });
      this.handleValueChanged(this.state.value);
    }
  };

  handleValueChanged = (value, option) => {
    this.setState({
      value: value,
    });
    this.props.onChange ? this.props.onChange(value) : null;
    this.props.onSelect ? this.props.onSelect(value, option.props.item) : null;
  };
  render() {
    const { product_id } = this.props;
    const { color_list, loading, value } = this.state;

    const options = color_list ? color_list.map(item => (
      <Select.Option item={item} key={item.id} value={item.id}>
        {item.name}
      </Select.Option>
    ))
      : null;
    return (
      <Select
        mode="multiple"
        value={value}
        loading={loading}
        onChange={this.handleValueChanged}
        onDropdownVisibleChange={() =>this.queryList(product_id)}
      >
        {options}
      </Select>
    )
  }
}

export default LookupProdColorList;