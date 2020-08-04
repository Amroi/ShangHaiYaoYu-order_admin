import React, { Component, useState } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
    Table,
    Card,
    Input,
    Row,
    Col,
    Button,
    Select,
    Modal,
    Upload,
    message,
    Drawer,
    InputNumber,
    Checkbox,
    Tag,
    Tooltip,
    Divider,
    Form
} from 'antd';
import { PopoverCustomer } from '../../component/Customer/customer';
import * as styles from './styles.less';
import cssModules from 'react-css-modules';
import { O2OProductStockStore } from '../../store/ProductStore'
import LookupBrandList from '../../component/O2O/LookupBrandList'
import LookupCustomer from '../../component/O2O/LookupCustomer';
const store = new O2OProductStockStore();
const locationList = [
    {
        id: "company",
        name: "公司仓",
    }, {
        id: "o2o",
        name: "线上仓",
    },
    {
        id: "vendor",
        name: "进货仓",
    }, {
        id: "customer",
        name: "客户仓",
    },
    {
        id: "repair",
        name: "维修仓",
    }
];

@withRouter
@observer
@cssModules(styles)
class O2OProductStockList extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'sku',
                dataIndex: "sku",
                width: 100
            },
            {
                title: '商品',
                dataIndex: "display_name",
                width: 240,
            },
            {
                title: '客户分货',
                dataIndex: "buy_limit",
                align: "center",
                width: 70,
                render: (val) => <Checkbox checked={val == 2} />
            },
            {
                title: '官方价',
                align: 'center',
                width: 80,
                dataIndex: "market_price",
                render: (val, record) => record.editing ?
                    <InputNumber defaultValue={val} onChange={(val) => record.market_price = val} /> : val,
            },
            {
                title: '线上库存',
                align: 'center',
                dataIndex: "have_qty",
                width: 80,
                render: (val) => <span style={{ color: "blue" }}>{val}</span>
            },
            {
                title: '客户仓',
                align: 'center',
                width: 80,
                dataIndex: "customer_qty",
                render: (val, record) => <a onClick={() => store.queryCustomerStock(record.id)}>{val}</a>
            },
            {
                title: '线上仓未出库',
                align: 'center',
                width: 70,
                dataIndex: 'online_lock_qty',
                render: (val, record) => <span style={{ color: 'red' }}>{val}</span>
            },
            {
                title: '客户仓未出库',
                align: 'center',
                width: 70,
                dataIndex: 'customer_lock_qty',
                render: (val, record) => <span style={{ color: 'red' }}>{val}</span>
            },
            {
                title: '库存更新',
                align: 'center',
                width: 80,
                dataIndex: "sync_stock_flag",
                render: (val, record) =>
                    <Tag color={val == 2 ? "#87d068" : "grey"} onClick={() => store.UpdateStockSyncFlag(record)}>{val == 2 ? '自动' : '手动'}</Tag>
            },
            {
                title: "更新人",
                align: 'center',
                width: 100,
                dataIndex: 'modified',
            },
            {
                title: '最后更新',
                align: 'center',
                width: 120,
                dataIndex: 'last_quoted_time',

            },
            {
                title: '操作',
                align: 'center',
                fixed: 'right',
                render: (val, record) => <div>
                    <a onClick={() => store.showEditor(record, 2)}>调整</a>
                    <Divider type='vertical' />
                    <a onClick={() => store.showEditor(record, 1)}>分货</a>
                </div>,
                width: 100
            },
        ]
    }

    showOrderRule = (record, action) => {
        store.showOrderRuleEditor(record, action)
    }

    render() {
        const rowSelection = {
            selectedRowKeys: store.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                store.selectedRowKeys = selectedRowKeys;
            }
        }
        const { dataList, total, page, page_size,
            onPageChange,
            handleSave,
            handleSearch,
            loading,
            editorStatus,
            postCustomerStock,
            checkCustomerExistsByName,
            currentEntity,
            customerStockDataList,
            selectedRowKeys,
            queryCustomerStock,
            handleAllClear,
            exportCustomerStockListWithProd,
            hideEditor } = store;
        return <div>
            <Card title='商品库存'>
                <ProductListSearchFilter handleSubmit={handleSearch} loading={loading} />
            </Card>
            <Card style={{ marginTop: 10 }}
            >
                <Button type='primary' loading={loading} style={{ marginBottom: 10, marginRight: 10 }} onClick={store.allSyncErpStock}>全部同步</Button>
                {selectedRowKeys.length > 0 && <Button type='primary' loading={loading} style={{ marginBottom: 10, marginLeft: 10 }} onClick={store.batchSyncErpStock}>同步({selectedRowKeys.length})</Button>}
                <Table
                    size='middle'
                    scroll={{ x: 1280 }}
                    loading={loading}
                    rowKey="id"
                    dataSource={dataList}
                    rowSelection={rowSelection}
                    columns={this.columns}
                    pagination={{ current: page, pageSize: page_size, total, onChange: onPageChange }}>
                </Table>
            </Card>

            {editorStatus == 1 ?
                <CustomerStockLimitEditor
                    entity={currentEntity}
                    visible={true}
                    loading={loading}
                    handleSave={postCustomerStock}
                    checkCustomerExistsByName={checkCustomerExistsByName}
                    handleClose={hideEditor} /> : null}

            {editorStatus == 2 ?
                <StockEditor
                    entity={currentEntity}
                    visible={true}
                    loading={loading}
                    handleSave={handleSave}
                    handleClose={hideEditor} /> : null}
            {editorStatus == 3 ?
                <CustomerStockList
                    dataList={customerStockDataList}
                    handleSearch={queryCustomerStock}
                    handleAllClear={handleAllClear}
                    exportCustomerStockList={exportCustomerStockListWithProd}
                    loading={loading}
                    visible={true}
                    handleClose={hideEditor} /> : null}
        </div>
    }
}

// 商品库存的查询大栏
const ProductListSearchFilter = ({ handleSubmit, loading }) => {
    const [form] = Form.useForm();
    const handleSearch = values => {
        // e ? e.preventDefault() : null;

        if (values.brand_list && values.brand_list.length > 0) {
            let brand_list = ''
            for (let idx in values.brand_list) {
                if (idx == 0) {
                    brand_list += values.brand_list[idx]
                } else {
                    brand_list += ',' + values.brand_list[idx]
                }
            }
            values.brand_list = brand_list
        }
        handleSubmit(values);
    };

    // const { getFieldDecorator } = form;
    return (
        <Form form={form} {...formItemLayout} onFinish={handleSearch}>
            <Row gutter={24}>
                <Col span={6} style={{ textAlign: 'left' }}>
                    <Form.Item label='商品名称' name="display_name">
                        <Input autoComplete='off' placeholder="商品名称" />
                        {/* {getFieldDecorator("display_name")(<Input autoComplete='off' placeholder="商品名称" />)} */}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label='分货模式' name="buy_limit" initialValue={0} >
                        <Select>
                            <Select.Option value={0}>全部</Select.Option>
                            <Select.Option value={1}>线上仓</Select.Option>
                            <Select.Option value={2}>按客户</Select.Option>
                        </Select>
                        {/* {getFieldDecorator("buy_limit", { initialValue: 0 })
                            (<Select >
                                <Select.Option value={0}>全部</Select.Option>
                                <Select.Option value={1}>线上仓</Select.Option>
                                <Select.Option value={2}>按客户</Select.Option>
                            </Select>)} */}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label='更新模式' name="stock_sync_flag" initialValue={0} >
                        <Select>
                            <Select.Option value={0}>全部</Select.Option>
                            <Select.Option value={1}>手动</Select.Option>
                            <Select.Option value={2}>自动</Select.Option>
                        </Select>
                        {/* {getFieldDecorator("stock_sync_flag", { initialValue: 0 })
                            (<Select >
                                <Select.Option value={0}>全部</Select.Option>
                                <Select.Option value={1}>手动</Select.Option>
                                <Select.Option value={2}>自动</Select.Option>
                            </Select>)} */}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="品牌" name="brand_list" >
                        <LookupBrandList />
                        {/* {getFieldDecorator("brand_list")
                            (<LookupBrandList />)
                        } */}
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button htmlType='submit' type="primary" style={{ marginTop: 4, float: "right" }} loading={loading} icon={<SearchOutlined/>}>
                        查询
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

// 库存调整单
const StockEditor = ({ visible, handleClose, handleSave, entity, loading }) => {
    const [form] = Form.useForm();
    const handleSubmit = () => {
        // e ? e.preventDefault() : null;
        form.validateFields().then(values => {
            if (values.change_type == 'dec') {
                let t = values.source_location;
                values.source_location = values.target_location;
                values.target_location = t;
            }
            values.product_id = entity.id;
            handleSave(values);
        }
        )
    };
    // const { getFieldDecorator } = form;

    return (
        <Modal width={520} title='库存调整单' confirmLoading={loading} visible={visible} onOk={handleSubmit} onCancel={handleClose}>
            <h3>{entity.display_name} </h3>
            <Divider />
            <Form form={form} labelCol={{span : 6}}  wrapperCol={{span : 18}} initialValues={
                {
                    source_location: 'company',
                    target_location: 'o2o',
                    change_type: 'inc',
                    qty: 1
                }
            }>
                <Form.Item label='发货仓'  name="source_location" rules={[{ required: true, message: "请输入数量" }]} >
                    <Select >
                        {locationList.map(item => item.id !== 'customer' ?
                            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option> : null)}
                    </Select>
                    {/* {getFieldDecorator("source_location", { initialValue: 'company', rules: [{ required: true, message: "请输入数量" }] })(
                        <Select  >
                            {locationList.map(item => item.id !== 'customer' ?
                                <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option> : null)}
                        </Select>)} */}
                </Form.Item>

                <Form.Item label='收货仓' name="target_location" rules={[{ required: true, message: "请输入数量" }]}>
                    <Select  >
                        {locationList.map(item => item.id !== 'customer' ?
                            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option> : null)}
                    </Select>
                    {/* {getFieldDecorator("target_location", { initialValue: 'o2o', rules: [{ required: true, message: "请输入数量" }] })(
                        <Select  >
                            {locationList.map(item => item.id !== 'customer' ?
                                <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option> : null)}
                        </Select>)} */}
                </Form.Item>
                <Form.Item label='调整类型' name="change_type" rules={[{ required: true, message: "请选择" }]}>
                    <Select   >
                        <Select.Option key={'inc'} value={'inc'}>增加</Select.Option>
                        <Select.Option key={'dec'} value={'dec'}>减少</Select.Option>
                    </Select>
                    {/* {getFieldDecorator("change_type",
                        { initialValue: 'inc', rules: [{ required: true, message: "请选择" }] })(
                            <Select   >
                                <Select.Option key={'inc'} value={'inc'}>增加</Select.Option>
                                <Select.Option key={'dec'} value={'dec'}>减少</Select.Option>
                            </Select>)} */}
                </Form.Item>

                <Form.Item label='数量' name="qty" rules={[{ required: true, message: "请输入数量" }]}>
                    <InputNumber min={1} />
                    {/* {getFieldDecorator("qty", { initialValue: 1, rules: [{ required: true, message: "请输入数量" }] })(<InputNumber min={1} />)} */}
                </Form.Item>
                <Form.Item label='备注' name="remark">
                    <Input />
                    {/* {getFieldDecorator("remark")(<Input />)} */}
                </Form.Item>
            </Form>
        </Modal>
    )
}

// 分货中的下面下栏
const CustomerStockEditor = ({ onNewRecord, onRemoveRecord, checkCustomerExistsByName, onConfirm, loading }) => {
    const [dataList, setdataList] = useState([]);

    const handleSelectCustomer = (cus) => {
        if (dataList.findIndex(item => item.customer_id == cus.id) !== -1) {
            message.warn(`${cus.name}此客户已在列表中`);
            return
        }
        let newData
        let item = {};
        item.customer_id = cus.id;
        item.id = item.customer_id;
        item.sno = dataList.length + 1;
        item.customer_name = cus.name;
        item.pass = true;
        item.qty = 1;
        newData = dataList.concat(item)
        setdataList(newData);
        onConfirm(newData);
    }
    const handleRemoveRow = (key) => {
        if (onRemoveRecord) {
            const item = dataList.find(item => item.id == key)
            // 删除不成功
            if (!onRemoveRecord(item)) {
                return
            }
        }
        let newData = dataList.filter(item => item.id !== key);
        setdataList(newData);
        onConfirm(newData);
    }
    const props = {
        name: 'file',
        style: { width: 60 },
        action: '/erp/o2o/product/stock/upload',
        headers: {
            access_token: sessionStorage.getItem('access_token'),
        },
        onChange: (info) => {
            if (info.file.status === 'done') {
                if (info.file.response.success) {
                    setdataList(info.file.response.data);
                    onConfirm(info.file.response.data);
                } else {
                    message.error(info.file.response.msg);
                }

            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 文件上传失败.`);
            }
        },
    };

    return (
        <div>
            <PopoverCustomer onSelect={handleSelectCustomer} />
            <Upload {...props}> <Button style={{ marginLeft: 5 }} type='primary' loading={loading}>上传模板</Button></Upload>
            <Table size='small' rowKey='customer_id' dataSource={dataList} loading={loading}>
                <Table.Column width={200}
                    title='序号'
                    render={(v, v1, sno) => sno + 1} width={24}></Table.Column>
                <Table.Column width={200} title='客户' dataIndex='customer_name' render={(val, record) => <span>{val}
                    <LegacyIcon style={{ color: record.pass ? "green" : "red" }} type={record.pass ? 'check' : 'close'} /></span>}></Table.Column>
                <Table.Column width={48} title='分配数' dataIndex='qty' render={(val, record) => <InputNumber min={1} defaultValue={val} onChange={val => record.qty = val} />}></Table.Column>
                <Table.Column width={48} title='操作' render={(_, record) => <Tooltip title='删行'><DeleteOutlined onClick={() => handleRemoveRow(record.id)} /></Tooltip>}></Table.Column>
            </Table>
        </div>
    );
}

const CustomerStockList = ({ visible, dataList, handleClose, handleSearch, handleAllClear, exportCustomerStockList, loading }) => {
    const [customerId, setCustomerId] = useState([]);
    const updateCustomerStock = (stock) => {
        store.removeStock({ product_id: stock.product_id, customer_id: stock.customer_id });
        // handleClose();
    }

    const product_id = dataList.length > 0 ? dataList[0].product_id : '';

    return <Modal width={700} visible={visible} onCancel={handleClose} confirmLoading={loading}>
        <div style={{ marginBottom: 10, marginTop: 15 }}>
            <LookupCustomer width={300} onChange={(v) => setCustomerId(v ? v.id : 0)} />
            <Button loading={loading} style={{ marginLeft: 10, marginTop: 2 }} type='primary' onClick={() => handleSearch(0, customerId)}>查询</Button>
            <Button loading={loading} style={{ marginLeft: 10, marginTop: 2 }} type='danger' onClick={() => handleAllClear(product_id)}>一键清除</Button>
            <Button loading={loading} style={{ float: 'right', marginRight: 20, marginTop: 2 }} onClick={() => exportCustomerStockList(product_id)}>导出</Button>
        </div>
        <Table size='small' dataSource={dataList} rowKey='customer_id'>
            <Table.Column dataIndex="customer_name" title='客户名称'></Table.Column>
            <Table.Column dataIndex="product_name" title='商品名称'></Table.Column>
            <Table.Column dataIndex="have_qty" align='center' title='剩余库存'></Table.Column>
            <Table.Column dataIndex="customer_id" render={(val, record, idx) =>
                <a onClick={() => updateCustomerStock(record)}>X</a>} />
        </Table>
    </Modal>
}

// 库存限购
const CustomerStockLimitEditor = ({ visible, handleClose, handleSave, entity, checkCustomerExistsByName, loading }) => {
    const [ form ] = Form.useForm();

    const handleSubmit = () => {
        // e ? e.preventDefault() : null;
        form.validateFields().then(values => {
            values.product_id = entity.id;
            values.items = JSON.stringify(values.items);
            handleSave(values);
        });
    };
    
    // // const { getFieldDecorator } = form;
    // // getFieldDecorator('items', { initialValue: [] });
    
    return (
        <Drawer width={'60%'}
            title={`${entity.display_name} 分货`}
            visible={visible}
            // onOk={handleSubmit}
            onClose={handleClose}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    borderTop: '1px solid #e9e9e9',
                    padding: '10px 16px',
                    background: '#fff',
                    textAlign: 'left',
                }}
            >
                <Button onClick={handleSubmit} loading={loading} type="primary">
                    更新库存
                </Button>
            </div>
            <Form form={form} {...formItemLayout} initialValues={{
                source_location: 'company', target_location: 'customer'
            }}>
                <Form.Item name="items" initialValue={[]} style={{ display: 'none' }} >

                </Form.Item>
                <Form.Item label="分货商品">
                    <span>{entity.display_name}</span>
                </Form.Item>
                <Form.Item label='发货仓' name="source_location" rules={[{ required: true, message: "请选择发货仓" }]}>
                    <Select>
                        {locationList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                    </Select>
                    {/* {getFieldDecorator("source_location", { initialValue: 'company', rules: [{ requcdired: true, message: "请选择发货仓" }] })(
                        <Select>
                            {locationList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                        </Select>)} */}
                </Form.Item>
                <Form.Item label='收货仓' name="target_location" rules={[{ required: true, message: "请选择收货仓" }]}>
                    <Select>
                        {locationList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                    </Select>
                    {/* {getFieldDecorator("target_location", { initialValue: 'customer', rules: [{ required: true, message: "请选择收货仓" }] })(
                        <Select>
                            {locationList.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                        </Select>)} */}
                </Form.Item>
                <Form.Item label='备注' name="remark">
                    <Input />
                    {/* {getFieldDecorator("remark")(<Input />)} */}
                </Form.Item>

                <CustomerStockEditor
                    checkCustomerExistsByName={checkCustomerExistsByName} loading={loading} onConfirm={(items) => form.setFieldsValue({ items })} />
            </Form>
        </Drawer>
    )
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
};
// const StockEditorView = Form.create({ name: 'stock_editor' })(StockEditor)
// const StockLimitEditorView = Form.create({ name: 'stock_limit_editor' })(CustomerStockLimitEditor)
// const ProductListSearch = Form.create({ name: 'product_search' })(ProductListSearchFilter);

export default O2OProductStockList;