import React from "react";
import { Select, message } from "antd";
import ajax from '../../util/api/ajax';
import { stringify } from "qs";

export default class LookupBrandList extends React.PureComponent {

  state = {
    loading: false,
    brandList: []
  }
  componentDidMount = () => {
    this.queryBrandList();
  }

  queryBrandList = async (params) => {
    const resp = await ajax({ url: '/erp/product/brand/list' + stringify(params) })
    if (resp.success) {
      this.setState({
        brandList: resp.data
      })
    }
  };

  handleValueChanged = (value, option) => {
    if (!value) {
      this.props.onChange ? this.props.onChange(0) : null;
    } else {
      let brandParam = [];
      for (let idx in option) {
        brandParam.push(option[idx].key);
      }
      this.props.onChange ? this.props.onChange(brandParam) : null;
    }

  };
  render() {
    const options = this.state.brandList.map(item => (
      <Select.Option label={item.name} key={item.id} value={item.name} item={item}>
        {item.name}
      </Select.Option>
    ));
    return (
      <Select
        mode="multiple"
        style={{ minWidth: 120 }}
        onChange={this.handleValueChanged}
      >
        {options}
      </Select>
    )
  }
}