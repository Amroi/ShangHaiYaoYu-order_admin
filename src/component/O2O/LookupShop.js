import React from 'react';
import { Spin, Select, message } from 'antd';
import ajax from '../../util/api/ajax';

async function queryShopList() {
  const resp = await ajax({ url: '/erp/org/shop/list', method: 'get' });
  if (resp.success) {
    return resp;
  } else {
    message.warn(resp.msg);
  }
}

class LookUpShopList extends React.PureComponent {
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
    this.handleSearch();
  };

  handleSearch = value => {
    try {
      this.setState({ loading: true });
      if (sessionStorage.getItem('shop_list')) {
        this.setState({ dataList: JSON.parse(sessionStorage.getItem('shop_list')) });
      } else {
        queryShopList({ name: value })
          .then(resp => resp.data)
          .then(dataList => {
            if (dataList) {
              this.setState({ dataList });
              sessionStorage.setItem('shop_list', JSON.stringify(dataList));
            }
          });
      }
    } finally {
      this.setState({ loading: false });
    }

  };

  handleValueChanged = (value, option) => {
    this.props.onChange ? this.props.onChange(value) : null;
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
        notFoundContent={loading ? <Spin size="small" /> : null}
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

export default LookUpShopList;