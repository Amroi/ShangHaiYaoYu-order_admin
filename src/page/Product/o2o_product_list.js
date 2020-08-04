import React, { useState } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { CloseOutlined, MinusCircleOutlined, PlusOutlined,SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Table,
    Card,
    Input,
    Row,
    Col,
    Button,
    Select,
    Divider,
    Checkbox,
    Drawer,
    InputNumber,
    Tooltip,
    Popconfirm,
    Form,
} from 'antd';
import * as styles from './styles.less';
import cssModules from 'react-css-modules';
import moment from 'moment';
import LookupBrandList from '../../component/O2O/LookupBrandList';
import LookupProdWithSku from '../../component/O2O/LookupProdWithSku';

@withRouter
@inject("o2o_productStore")
@observer
@cssModules(styles)
class O2OProductList extends React.Component {
    columns = [
        {
            title: 'sku',
            align: 'center',
            dataIndex: "sku",
            width: 160,
        },
        {
            title: '显示名称',
            dataIndex: "display_name",
            width: '25%',
            render: (val, record) => <span style={{ color: "black" }}>
                {val}
                <div style={{ color: "grey", fontSize: 12 }}>
                    {record.keyword}
                </div>
            </span>
        },
        {
            title: '绑定机型',
            width: '20%',
            render: (_, record) =>
                <span >  {record.erp_product.name}  {record.erp_product_color && record.erp_product_color.name} </span>
        },
        {
            title: '官方价',
            align: 'center',
            dataIndex: "market_price",
            width: 80,
        },
        {
            title: '默认价',
            align: 'center',
            width: 80,
            render: (val, record) => {
                if (record.order_rules) {
                    let item = record.order_rules.find(item => item.customer_type == 'default');
                    if (item) {
                        return item.order_price;
                    }
                }
                return <CloseOutlined style={{ color: 'red' }} />;
            }
        },
        {
            title: '渠道价',
            align: 'center',
            width: 80,
            render: (val, record) => {
                if (record.order_rules) {
                    let item = record.order_rules.find(item => item.customer_type == 'qu_dao');
                    if (item) {
                        return item.order_price;
                    }
                }
                return <CloseOutlined style={{ color: 'red' }} />;
            }
        },
        {
            title: '特殊价',
            align: 'center',
            width: 80,
            render: (val, record) => {
                if (record.order_rules) {
                    let item = record.order_rules.find(item => item.customer_type == 'te_shu');
                    if (item) {
                        return item.order_price;
                    }
                }
                return <CloseOutlined style={{ color: 'red' }} />;
            }
        },
        {
            title: '发布日期',
            align: 'center',
            dataIndex: "modify_time",
            render: (val) => moment(val).format('L'),
            width: 120
        },
        {
            title: '发布人',
            align: 'center',
            dataIndex: "create_user",
            width: 120
        },
        {
            title: '操作',
            align: 'center',
            fixed: "right",
            width: 180,
            render: (_, record) =>
                <span>
                    <a color='green' onClick={() => { this.props.o2o_productStore.changeStatus(record, !record.is_public) }}>
                        {record.is_public ? '下架' : '上架'}</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.showOrderRule(record)}>详情</a>
                    <span><Divider type="vertical" />
                        <Popconfirm title="相关库存也将被清空，确定删除吗?" onConfirm={() => this.removeProd(record.id)} okText="确定" cancelText="取消">
                            <a href="javascript:;" disabled={record.is_public}>删除</a>
                        </Popconfirm></span>

                </span>,
        },
    ];

    showOrderRule = (record, action) => {
        this.props.o2o_productStore.showOrderRuleEditor(record, action)
    }

    showProductOrderRule = (record) => {
        this.props.o2o_productStore.changeProductOrderRuleVisible();
    }

    removeProd = (prodId) => {
        this.props.o2o_productStore.removeProd(prodId);
    }

    componentDidMount = () => {
        this.props.o2o_productStore.handleSearch();
    }

    render() {
        const { dataList, total, page, page_size, onPageChange, handleSearch, loading } = this.props.o2o_productStore;

        return <div>
            <Card title='商品管理'>
                <ProductListSearchFilter handleSubmit={handleSearch} loading={loading} />
            </Card>

            <Card style={{ marginTop: 10 }}>
                <Button type='primary' style={{ marginBottom: 5 }} loading={loading}
                    onClick={() => this.showOrderRule(null, 'new')}>新建</Button>
                <Table
                    scroll={{ x: 1300 }}
                    loading={loading}
                    rowKey="id"
                    dataSource={dataList}
                    columns={this.columns}
                    pagination={{ current: page, pageSize: page_size, total, onChange: onPageChange }}>
                </Table>
            </Card>
        </div>
    }
}

// 商品管理的查询大栏
const ProductListSearchFilter = ({ handleSubmit, loading }) => {
    const [ form ] = Form.useForm();
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
        <Form form={form} {...formItemLayout} layout='horizontal' onFinish={handleSearch}>
            <Row gutter={24}>
                <Col span={7} style={{ textAlign: 'left' }}>
                    <Form.Item label='商品名称' name='display_name'>
                        <Input autoComplete='off' placeholder="商品名称" />
                        {/* {getFieldDecorator("display_name")()} */}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item label='sku' name='sku'>
                        <Input autoComplete='off' placeholder="商品 sku" />
                        {/* {getFieldDecorator("sku")
                            (<Input autoComplete='off' placeholder="商品 sku" />)} */}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item label="品牌" name='brand_list'>
                        <LookupBrandList />
                        {/* {getFieldDecorator("brand_list")
                            (<LookupBrandList />)
                        } */}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item label='上架状态' name='is_public' initialValue='3'>
                        <Select>
                            <Select.Option value='3'>全部</Select.Option>
                            <Select.Option value='1'>已上架</Select.Option>
                            <Select.Option value='0'>未上架</Select.Option>

                        </Select>
                        {/* {getFieldDecorator("is_public", { initialValue: '3' })
                            (<Select>
                                <Select.Option value='3'>全部</Select.Option>
                                <Select.Option value='1'>已上架</Select.Option>
                                <Select.Option value='0'>未上架</Select.Option>

                            </Select>)} */}
                    </Form.Item>
                </Col>
                <Col span={16} style={{ textAlign: "right" }}>
                    <Button type="primary" htmlType="submit" style={{ marginTop: 6 }} loading={loading} icon={<SearchOutlined />}>
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

// 商品发布
const ProductOrderRuleEditor = ({ productEntity, handleSaveRule, handleSaveProduct, handleCancel, visible, loading }) => {
    const [form] = Form.useForm();
    const handleSubmit = e => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.buy_limit = values.buy_limit ? 2 : 1;
            Object.keys(values).map(key => productEntity[key] = values[key]);
            productEntity.order_rules = orderRules;

            handleSaveProduct(productEntity);
        })
    }

    // const { getFieldDecorator } = form;
    const [orderRules, setOrderRules] = useState(productEntity.order_rules);

    const handleRow = (record, action) => {
        const resp = handleSaveRule(record, action);
        if (!resp.success) {
            return;
        }
        if (action == "remove" || action == 'cancel') {
            const newItems = orderRules.filter(item => item.id !== record.id);
            setOrderRules(newItems);
        } else if (action == 'create') {

            setOrderRules(orderRules.concat(resp.data));
        } else {
            const idx = orderRules.findIndex(item => item.id == record.id);
            if (idx > -1) {
                orderRules.splice(idx, 1, resp.data);
                setOrderRules(orderRules);
            }
        }
    };
    //等待删除  
    const onChangeColor = (value, prevValue) => { return value.name };
    getFieldDecorator('product_id', { initialValue: productEntity.product_id });
    getFieldDecorator('color_id', { initialValue: productEntity.color_id });
    getFieldDecorator('brand_id', { initialValue: productEntity.brand_id });
    const erp_product_id = form.getFieldValue('product_id');

    return (
        <Drawer
            width={'75%'}
            title="订货规则"
            visible={visible}
            onClose={handleCancel} >
            <Form form={form} layout='horizontal' labelAlign='left' >
                <Form.Item label='sku' {...formItemLayout} name='sku'>
                    <LookupProdWithSku defaultVal={productEntity.sku} onSelect={val => form.setFieldsValue({
                        sku: val.id,
                        erp_product_name: val.name,
                        color_id: val.color_id,
                        erp_color_name: val.color,
                        product_id: val.product_id,
                        display_name: val.name + ' ' + val.color,
                    })} />
                    {/* {getFieldDecorator("sku", { initialValue: productEntity.sku })(<LookupProdWithSku defaultVal={productEntity.sku} onSelect={val => form.setFieldsValue({
                        sku: val.id,
                        erp_product_name: val.name,
                        color_id: val.color_id,
                        erp_color_name: val.color,
                        product_id: val.product_id,
                        display_name: val.name + ' ' + val.color,
                    })} />)} */}
                </Form.Item>
                <Form.Item label='显示名称' {...formItemLayout} name='display_name'>
                    <Input placeholder='请输入发布名称' />
                    {/* {getFieldDecorator("display_name", {
                        initialValue: productEntity.display_name, rules: [{
                            required: true,
                            message: "请输入发布名称"
                        }]
                    })(<Input placeholde='请输入发布名称'></Input>)} */}
                </Form.Item>

                <Form.Item label='绑定机型' {...formItemLayout} name='erp_product_name'>
                    <Input readOnly />
                    {/* {getFieldDecorator("erp_product_name", {
                        initialValue: productEntity.erp_product ? productEntity.erp_product.name : "", rules: [{
                            required: true,
                            message: "请选择机型"
                        }]
                    })(<Input readOnly />)} */}
                </Form.Item>
                <Form.Item label='绑定颜色' {...formItemLayout} name='erp_color_name'>
                    <Input readOnly />
                    {/* {getFieldDecorator("erp_color_name", {
                        initialValue: productEntity.erp_product_color ? productEntity.erp_product_color.name : '',
                        rules: [{
                            required: true,
                            message: "请选择颜色"
                        }]
                    })(<Input readOnly />)} */}
                </Form.Item>

                <Form.Item {...formItemLayout} label='官方价' name='market_price'>
                    <InputNumber min={0} />
                    {/* {getFieldDecorator("market_price", {
                        initialValue: productEntity.market_price, rules: [{
                            required: true, message: "请输入单价"
                        }]
                    })(<InputNumber min={0}></InputNumber>)} */}
                </Form.Item>
                <Form.Item {...formItemLayout} label="使用客户分货" name='buy_limit'>
                    <Checkbox />
                    {/* {getFieldDecorator("buy_limit", {
                        initialValue: productEntity.buy_limit === 2, valuePropName: 'checked',
                    })(<Checkbox />)} */}
                </Form.Item>
                <Form.Item {...formItemLayout} label='备注' name='keyword'>
                    <Input />
                    {/* {getFieldDecorator("keyword", {
                        initialValue: productEntity.keyword, rules: [{
                            required: false, message: ""
                        }]
                    })(<Input />)} */}
                </Form.Item>
                <Table size='small' dataSource={orderRules} pagination={false} rowKey='id'>
                    <Table.Column dataIndex='customer_type' title='客户类型' render={(val, record) => {
                        return <Select defaultValue={val} onSelect={v => record.customer_type = v}>
                            <Select.Option value='default'>
                                默认
                             </Select.Option>
                            <Select.Option value='qu_dao'>
                                渠道
                             </Select.Option>
                            <Select.Option value='te_shu'>
                                特殊
                             </Select.Option>
                            {/* <Select.Option value='te_shu_one'>
                                特殊 1
                             </Select.Option> */}
                        </Select>
                    }}></Table.Column>
                    <Table.Column dataIndex='order_price' title='订购价' render={(val, record) => <InputNumber defaultValue={val} onChange={val => record.order_price = val} />}></Table.Column>
                    <Table.Column dataIndex='enable_order' title='允许订货' render={(val, record) => <Checkbox defaultChecked={val} onChange={val => record.enable_order = val.target.checked} />}></Table.Column>
                    <Table.Column dataIndex='id' title='操作' render={(val, record) => <Tooltip title='删行'> <MinusCircleOutlined
                        style={{ marginRight: 2, color: "red" }}
                        onClick={() => handleRow(record, 'remove')} />
                    </Tooltip>} />


                </Table>

                <Button type='dashed' style={{ width: '100%', marginTop: 5 }} onClick={() => handleRow(null, 'create')} >
                    <PlusOutlined />添加分类
                   </Button>


            </Form>
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
                <Button onClick={handleSubmit} type="primary" loading={loading}>
                    提交
                </Button>
            </div>
        </Drawer>
    );
}

// const ProductOrderRuleEditorForm = Form.create({ name: 'product_order_rule_edit' })(ProductOrderRuleEditor);
// const ProductListSearch = Form.create({ name: 'product_search' })(ProductListSearchFilter);
export default O2OProductList;