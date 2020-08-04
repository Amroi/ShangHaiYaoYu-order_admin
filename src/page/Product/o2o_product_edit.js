import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Input,
    Checkbox,
    InputNumber,
    Row,
    Col,
    Divider,
    Table,
    Select,
    Button,
    Tooltip,
    Form,
} from 'antd';
import LookupProdWithSku from '../../component/O2O/LookupProdWithSku';
import { withRouter, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { SingleImageUpload } from '../../component/O2O/ZksoftUpload';

// 商品管理中的详情页面
@withRouter
@inject("o2o_productStore")
@observer
class ProductEdit extends React.Component {
    formRef = React.createRef();
    state = {
        orderRules: [],
        product_id: 0,
        brand_id: 0,
        erp_product_name: '',
        color_id: 0,
        erp_color_name: '',
        display_name: '',
    }
    componentDidMount = () => {
        
        const { currentEntity } = this.props.o2o_productStore;
        if (!currentEntity) {
            if (this.props.o2o_productStore.setDefaultCurEntity()) {
                this.setState({
                    orderRules: currentEntity ? currentEntity.order_rules : [],
                })
            }
        } else {
            this.setState({
                orderRules: currentEntity ? currentEntity.order_rules : [],
            })
        }
    };

    setOrderRules = (val) => {
        this.setState({
            orderRules: val,
        })
    };

    handleSubmit = e => {
        e ? e.preventDefault() : null;
        // const { form } = this.props;
        const { currentEntity } = this.props.o2o_productStore;
        
        this.formRef.current.validateFields().then(values => {

            currentEntity.order_rules = this.state.orderRules;
            currentEntity.erp_color_name = this.state.erp_color_name;
            currentEntity.product_id = this.state.product_id;
            values.buy_limit = values.buy_limit ? 2 : 1;
            Object.keys(values).map(key => currentEntity[key] = values[key]);
            // currentEntity.display_name = this.state.display_name;
            this.props.o2o_productStore.handleSaveProduct(currentEntity);
        
        })
    };

    handleRow = (record, action) => {
        const resp = this.props.o2o_productStore.handleSaveRule(record, action);
        const { orderRules } = this.state;
        if (!resp.success) {
            return;
        }
        if (action === "remove" || action === 'cancel') {
            const newItems = orderRules.filter(item => item.id !== record.id);
            this.setOrderRules(newItems);
        } else if (action === 'create') {
            this.setOrderRules(orderRules.concat(resp.data));
        } else {
            const idx = orderRules.findIndex(item => item.id == record.id);
            if (idx > -1) {
                orderRules.splice(idx, 1, resp.data);
                this.setOrderRules(orderRules);
            }
        }
    };

    render() {
        // const { getFieldDecorator } = this.props.form;
        const { o2o_productStore } = this.props;
        const { currentEntity, loading } = o2o_productStore;
        const { orderRules } = this.state;
        const formItemLayout = {
            labelCol: {
                span: 4
            },
            wrapperCol: {
                span: 16,
            },
        };



        // getFieldDecorator('product_id', { initialValue: currentEntity && currentEntity.product_id });
        // getFieldDecorator('color_id', { initialValue: currentEntity && currentEntity.color_id });
        // getFieldDecorator('brand_id', { initialValue: currentEntity && currentEntity.brand_id });
        return (
            <div>
                <Card title='商品编辑'>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            width: '20%',
                            borderTop: '1px solid #e9e9e9',
                            padding: '10px 16px',
                            zIndex: 1000,
                        }}>
                        <span style={{ float: 'right' }}>
                            <Button loading={loading} type='danger' onClick={() => { window.history.back(-1) }}>返回</Button>
                            <Button loading={loading} onClick={this.handleSubmit} style={{ marginLeft: 20, marginRight: 40 }} type='primary'>提交</Button>
                        </span>
                    </div>
                    <Divider>商品信息</Divider>
                    <Form ref={this.formRef} {...formItemLayout} initialValues={{
                        sku: currentEntity && currentEntity.sku,
                        display_name: currentEntity && currentEntity.display_name,
                        erp_product_name: currentEntity && currentEntity.erp_product ? currentEntity.erp_product.name : "",
                        erp_color_name: currentEntity && currentEntity.erp_product_color ? currentEntity.erp_product_color.name : '',
                        market_price: currentEntity && currentEntity.market_price,
                        buy_limit: currentEntity && currentEntity.buy_limit === 2,
                        keyword: currentEntity && currentEntity.keyword,
                        url: currentEntity && currentEntity.url,
                        product_id: currentEntity && currentEntity.product_id,
                        color_id: currentEntity && currentEntity.color_id,
                        brand_id: currentEntity && currentEntity.brand_id,
                    }}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="product_id" style={{ display: 'none' }} >
                                </Form.Item>
                                <Form.Item name="color_id" style={{ display: 'none' }} >
                                </Form.Item>
                                <Form.Item name="brand_id" style={{ display: 'none' }} >
                                </Form.Item>

                                <Form.Item label='sku' name="sku" rules={[{ required: true, message: '请选择商品' }]}>
                                    <LookupProdWithSku
                                        defaultVal={currentEntity && currentEntity.sku} onSelect={val => {
                                            this.formRef.current.setFieldsValue({
                                                sku: val.id,
                                                erp_product_name: val.name,
                                                color_id: val.color_id,
                                                erp_color_name: val.color,
                                                product_id: val.product_id,
                                                display_name: val.name + ' ' + val.color,
                                            });
                                            this.setState({
                                                erp_product_name: val.name,
                                                color_id: val.color_id,
                                                erp_color_name: val.color,
                                                product_id: val.product_id,
                                                display_name: val.name + ' ' + val.color,
                                            })
                                        }} />
                                    {/* {getFieldDecorator("sku", { initialValue: currentEntity && currentEntity.sku, rules: [{ required: true, message: '请选择商品' }] })
                                    (<LookupProdWithSku
                                        defaultVal={currentEntity && currentEntity.sku} onSelect={val => {
                                            form.setFieldsValue({
                                                sku: val.id,
                                                erp_product_name: val.name,
                                                color_id: val.color_id,
                                                erp_color_name: val.color,
                                                product_id: val.product_id,
                                                display_name: val.name + ' ' + val.color,
                                            });
                                            this.setState({
                                                erp_product_name: val.name,
                                                color_id: val.color_id,
                                                erp_color_name: val.color,
                                                product_id: val.product_id,
                                                display_name: val.name + ' ' + val.color,
                                            })
                                        }} />)} */}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='显示名称' name="display_name" rules={[{ required: true, message: '请输入发布名称' }]}>
                                    <Input placeholde='请输入发布名称'></Input>
                                    {/* {getFieldDecorator("display_name", {
                                        initialValue: currentEntity && currentEntity.display_name, rules: [{
                                            required: true,
                                            message: "请输入发布名称"
                                        }]
                                    })(<Input placeholde='请输入发布名称'></Input>)} */}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='绑定机型' name="erp_product_name">
                                    <Input readOnly />
                                    {/* {getFieldDecorator("erp_product_name", {
                                        initialValue: currentEntity && currentEntity.erp_product ? currentEntity.erp_product.name : ""
                                    })
                                        (<Input readOnly />)} */}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='绑定颜色' name="erp_color_name">
                                    <Input readOnly />
                                    {/* {getFieldDecorator("erp_color_name", {
                                        initialValue: currentEntity && currentEntity.erp_product_color ? currentEntity.erp_product_color.name : ''
                                    })
                                        (<Input readOnly />)} */}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label='官方价' name="market_price" rules={[{ required: true, message: '请输入单价' }]} >
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                    {/* {getFieldDecorator("market_price", {
                                        initialValue: currentEntity && currentEntity.market_price, rules: [{
                                            required: true, message: "请输入单价"
                                        }]
                                    })(<InputNumber min={0} style={{width: '100%'}} />)} */}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="使用客户分货" name="buy_limit" valuePropName='checked'>
                                    <Checkbox />
                                    {/* {getFieldDecorator("buy_limit", {
                                        initialValue: currentEntity && currentEntity.buy_limit === 2, valuePropName: 'checked',
                                    })(<Checkbox />)} */}
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label='备注' name="keyword" labelCol={{ span: 2 }} wrapperCol={{ span: 20 }}>
                                    <Input />
                                    {/* {getFieldDecorator("keyword", {
                                        initialValue: currentEntity && currentEntity.keyword
                                    })(<Input />)} */}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider>商品报价</Divider>
                        <Table dataSource={orderRules} pagination={false} rowKey='id'>
                            <Table.Column dataIndex='customer_type' title='客户类型' render={(val, record) => {
                                return <Select defaultValue={val} onSelect={v => record.customer_type = v}>
                                    <Select.Option value='default'>默认</Select.Option>
                                    <Select.Option value='qu_dao'>渠道</Select.Option>
                                    <Select.Option value='te_shu'>特殊</Select.Option>
                                </Select>
                            }}></Table.Column>
                            <Table.Column dataIndex='order_price' title='订购价' align='center' render={(val, record) => <InputNumber min={0} defaultValue={val} onChange={val => record.order_price = val} />}></Table.Column>
                            <Table.Column dataIndex='enable_order' title='允许订货' align='center' render={(val, record) => <Checkbox defaultChecked={val} onChange={val => record.enable_order = val.target.checked} />}></Table.Column>
                            <Table.Column dataIndex='id' title='操作' align='center' render={(val, record) => <Tooltip title='删行'> <MinusCircleOutlined
                                style={{ marginRight: 2, color: "red" }}
                                onClick={() => this.handleRow(record, 'remove')} />
                            </Tooltip>} />
                        </Table>
                        <Button
                            type='dashed'
                            style={{ width: '100%', marginTop: 5 }}
                            onClick={() => this.handleRow(null, 'create')}>
                            <PlusOutlined />添加分类</Button>

                        <Divider style={{ marginTop: 40 }}>商品图片</Divider>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label='主图' name="url" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                                    <SingleImageUpload big />
                                    {/* {getFieldDecorator('url', { initialValue: currentEntity && currentEntity.url })(
                                        <SingleImageUpload big />
                                    )} */}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </div>
        );
    }
}

export default ProductEdit;