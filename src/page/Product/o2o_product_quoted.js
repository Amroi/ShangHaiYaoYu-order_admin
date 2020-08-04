import React, { Component, useState } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Table,
    Card,
    Input,
    Row,
    Col,
    Button,
    Divider,
    Upload,
    InputNumber,
    Popover,
    message,
    Form
} from 'antd';
import * as styles from './styles.less';
import cssModules from 'react-css-modules';
import moment from 'moment';
import store from '../../store/ProductQuotedStore'
import LookupBrandList from '../../component/O2O/LookupBrandList'
@withRouter
@observer
@cssModules(styles)

// 商品报价
class O2OProductQuotedList extends Component {
    constructor(props) {
        super(props);

        this.columns = [
            {
                title: '商品',
                dataIndex: "display_name",
                width: 200

            },
            {
                title: '官方价',
                align: 'center',
                dataIndex: "market_price",
                render: (val, record) => record.editing ?
                    <InputNumber defaultValue={val} onChange={(val) => record.market_price = val} /> : val,
                width: 48,
            },
            {
                title: '默认',
                align: 'center',
                width: 48,
                render: (val, record) => {
                    let item = record.order_rules.find(item => item.customer_type == 'default');
                    if (item) {
                        return record.editing ?
                            <InputNumber defaultValue={item.order_price} onChange={(val) => item.order_price = val} /> : item.order_price;
                    }
                    return <CloseOutlined style={{ color: 'red' }} />;
                }
            },
            {
                title: '渠道',
                align: 'center',
                width: 48,
                render: (val, record) => {
                    let item = record.order_rules.find(item => item.customer_type == 'qu_dao');
                    if (item) {
                        return record.editing ?
                            <InputNumber defaultValue={item.order_price} onChange={(val) => item.order_price = val} /> : item.order_price;
                    }
                    return <CloseOutlined style={{ color: 'red' }} />;
                }
            },
            {
                title: '特殊',
                align: 'center',
                width: 48,
                render: (val, record) => {
                    let item = record.order_rules.find(item => item.customer_type == 'te_shu');
                    if (item) {
                        return record.editing ?
                            <InputNumber defaultValue={item.order_price} onChange={(val) => item.order_price = val} /> : item.order_price;
                    }
                    return <CloseOutlined style={{ color: 'red' }} />;
                }
            },
            {
                title: '上次报价',
                align: 'center',
                dataIndex: "prev_market_price",
                render: (val) => val ? val : <CloseOutlined style={{ color: 'red' }} />,
                width: 48,
            },
            {
                title: '最后报价日期',
                align: 'center',
                dataIndex: "last_quoted_time",
                render: (val) => moment(val).format('MM-DD HH:mm:ss'),
                width: 84,
            },
            {
                title: '更新人',
                align: 'center',
                dataIndex: "modified",
                width: 84,
            },
            {
                title: '更新时间',
                align: 'center',
                dataIndex: "modify_time",
                width: 100,
            },
            {
                title: '操作',
                align: 'center',
                render: (val, record) => {
                    if (record.editing) {
                        return <span> <a onClick={() => store.handleQuoted(record, 'save')}>更新</a><Divider type='vertical' />
                        <a onClick={() => store.handleQuoted(record, 'cancel')}>取消</a></span>
                    } else {
                        return <a onClick={() => store.handleQuoted(record, 'edit')}>报价</a>
                    }
                },
                // render: (val, record) => record.editing ?  : ,
                width: 80
            },
        ]
    }

    showOrderRule = (record, action) => {
        store.showOrderRuleEditor(record, action)
    }

    componentWillUnmount = () => {
        store.loading = false;
    }

    render() {
        const props = {
            name: 'file',
            style: { width: 60 },
            action: '/erp/o2o/product/quoted/upload',
            headers: {
                access_token: sessionStorage.getItem('access_token'),
            },
            onChange: (info) => {
                store.loading = true;
                if (info.file.status === 'done') {
                    store.loading = false;
                    if (info.file.response.success) {
                        let params = {
                            page: 1,
                        }
                        store.load(params);
                        message.success(info.file.response.msg);
                    } else {
                        message.error(info.file.response.msg);
                    }
                } else if (info.file.status === 'error') {
                    store.loading = false;
                    message.error(`${info.file.name} 文件上传失败.`);
                }
            },
        };

        const { dataList, total, page, page_size, onPageChange, handleSearch, loading,
            orderRuleEditorStatus,
            hideOrderRuleEditor,
            handleSaveProduct,
            handleSaveRule,
            currentEntity } = store;
        return <div>
            <Card title='商品报价'>
                <ProductListSearchFilter handleSubmit={handleSearch} loading={loading} />
            </Card>

            <Card style={{ marginTop: 10 }} extra={<div>
                <Row gutter={8}>
                    <Col span={12}>
                        <Upload {...props}>
                            <Button type='default' loading={loading}>上传</Button>
                        </Upload>
                    </Col>
                    <Col span={12}>
                        <Button loading={loading} type='default' onClick={() => store.export()}>导出</Button>
                    </Col>
                </Row>
            </div>}>
                <Table
                    size='middle'
                    loading={loading}
                    rowKey="id"
                    dataSource={dataList}
                    columns={this.columns}
                    pagination={{ current: page, pageSize: page_size, total, onChange: onPageChange }}>
                </Table>
            </Card>

            {orderRuleEditorStatus ?
                <ProductOrderRuleEditorForm
                    visible={orderRuleEditorStatus}
                    productEntity={currentEntity}
                    handleCancel={hideOrderRuleEditor}
                    handleSaveProduct={handleSaveProduct}
                    handleSaveRule={handleSaveRule} /> : null}
        </div>
    }
}

// 弹出显示
const PopoverBrand = ({ onSelect }) => {
    const [visible, setViaible] = useState(false);
    const data = [];
    for (var i = 0; i < 100; i++) {
        data.push({
            key: i + 1,
            code: 'code' + i,
            name: 'name' + i
        })
    }
    const dataView = <div>
        <Input.Search style={{ marginBottom: 10 }} />
        <Table style={{ width: 400 }} size='small' dataSource={data}>
            <Table.Column dataIndex='code'></Table.Column>
            <Table.Column dataIndex='name'></Table.Column>
            <Table.Column dataIndex='id' render={(_, record) => <a onClick={() => { setViaible(false); onSelect(record) }}>选择</a>}></Table.Column>
        </Table>
    </div>
    return (
        <Popover style={{ width: 500 }} content={dataView} title="品牌"
            trigger="click" visible={visible} onVisibleChange={() => setViaible(!visible)}>
            <SearchOutlined />
        </Popover>
    );
}

// 商品报价的查询大栏
const ProductListSearchFilter = ({ handleSubmit, loading }) => {
    const [form] = Form.useForm();
    const handleSearch = values => {
        // e ? e.preventDefault() : null;
        if (values.brand_list && values.brand_list.length > 0) {
            let brand_list = '';
            for (let idx in values.brand_list) {
                if (idx == 0) {
                    brand_list += values.brand_list[idx];
                } else {
                    brand_list += ',' + values.brand_list[idx];
                }
            }
            values.brand_list = brand_list;
        }
        handleSubmit(values);
        
    };

    // const { getFieldDecorator } = form;
    return (
        <Form form={form} {...formItemLayout} onFinish={handleSearch}>
            <Row gutter={15}>
                <Col span={6}>
                    <Form.Item label='商品名称' name="display_name">
                    <Input autoComplete='off' placeholder="商品名称" />
                        {/* {getFieldDecorator("display_name")(<Input autoComplete='off' placeholder="商品名称" />)} */}
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
                <Col span={4} >
                    <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }} loading={loading} icon={<SearchOutlined />}>
                        查询
                    </Button>
                </Col>
            </Row>
        </Form>
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

// const ProductListSearch = Form.create({ name: 'product_search' })(ProductListSearchFilter);

export default O2OProductQuotedList;