
import React, { useState } from 'react'
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Modal, Input, Form } from 'antd';
import ajax from '../../util/api/ajax';
import { stringify } from 'qs';

let gobal_filter = { page: 1 }
let cache_data = [];
const O2OProductLookup = ({ onClose, onSelect, visible, rowSelection, handleChange }) => {
  const loadProductList = (filter = {}) => {
    setLoading(true);
    filter.return_total = true;
    filter.is_public = 1;
    ajax({ url: "/erp/o2o/product/list?" + stringify(filter), method: "GET" }).then(resp => {
      setLoading(false);
      gobal_filter = { ...filter }
      if (resp.success) {
        setDataList(resp.data);
        setTotal(resp.total);
        cache_data.splice(0, cache_data.length, resp.data);
      } else {
        setTotal(0);
        setDataList([])
      }
    });
  }

  const onPageChange = (page) => {
    let newFilter = { ...gobal_filter };
    newFilter.page = page;
    loadProductList(newFilter);
  }
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [dataList, setDataList] = useState(() => onPageChange(gobal_filter.page));

  return <Modal
    onOk={() => onSelect()}
    onCancel={onClose}
    visible={visible} width={'50%'}>
    <div style={{marginBottom : 8}}>
      <Form  layout='inline' labelAlign='center'>
        <Form.Item>
          <Input.Search style={{ minWidth: 180 }} placeholder='商品名称' onSearch={(val) =>
            loadProductList({ page: 1, display_name: val })} />
        </Form.Item>
      </Form>
    </div>

    <Table bordered
      size='middle'
      rowSelection={rowSelection}
      onRow={record => {
        return {
          onClick: () => handleChange(record)
        }
      }}
      rowKey={'id'}
      loading={loading}
      dataSource={dataList}
      pagination={{ current: gobal_filter.page, page_size: 20, total: total, onChange: onPageChange }}>
      <Table.Column dataIndex='sku' title='sku'></Table.Column>
      <Table.Column dataIndex='display_name' title='名称'></Table.Column>
    </Table>
  </Modal>
}

const SearchO2OProduct = (props) => {
  const [visible, setVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const onSelect = () => {
    setVisible(false);
    if (selectedRows.length > 0) {
      props.onSelect(selectedRows[0]);
    }
  };

  function handleChange(item) {
    setSelectedRows([item]);
    let keys = [item.id];
    setSelectedRowKeys(keys);
  }

  const rowSelection = {
    type: props.showType ? 'checkbox' : 'radio',
    selectedRowKeys,
    onChange: (_, r) => handleChange(r[0]),
  };
  return (
    <div>
      {props.editStatus == 'edit' ?
        <Input.Search
          value={props.value}
          readOnly
          style={{ minWidth: 100 }} onSearch={() => setVisible(!visible)} /> : props.value}

      {visible ? <O2OProductLookup
        rowSelection={rowSelection}
        visible={visible}
        handleChange={handleChange}
        onSelect={onSelect}
        onClose={() => setVisible(false)} /> : null}
    </div>
  )
}

export { O2OProductLookup, SearchO2OProduct };