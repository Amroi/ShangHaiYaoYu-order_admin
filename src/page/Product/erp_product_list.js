import React, { Component, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
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
    Modal,
    Tag,
    Checkbox,
    Divider,
    InputNumber,
    Form
} from 'antd';
import * as styles from './styles.less';
import cssModules from 'react-css-modules';

@withRouter
@inject("erp_productStore")
@observer
@cssModules(styles)
class ErpProductList extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: '编码',
                dataIndex: "code",
                width: 64,
            },
            {
                title: '名称',
                dataIndex: "name",
                width: '30%',

            },

            {
                title: '类别',
                dataIndex: "category.name",
                width: 84
            },
            {
                title: '类型',
                dataIndex: "product_type.name",
                width: 84
            },
            {
                title: '操作',
                dataIndex: "id",
                width: 84,
                render: (val, record, idx) => <Button type='primary' onClick={() => this.props.erp_productStore.handleEdit(record)}>上架</Button>
            },
        ]
    }

    render() {
        const { dataList, total, page, page_size, onPageChange, handleSearch, loading, editorStatus, handleSave, handleCancel, currentEntity } = this.props.erp_productStore;
        return <div>
            <Card title='商品列表'>
                <ProductListSearchFilter handleSubmit={handleSearch} loading={loading} />
            </Card>
            <Card style={{ marginTop: 10 }}>
                <Table
                    size='middle'
                    loading={loading}
                    rowKey="id"
                    dataSource={dataList}
                    bordered
                    columns={this.columns}
                    pagination={{ current: page, pageSize: page_size, total, onChange: onPageChange }}>
                </Table>
            </Card>

            {editorStatus ?
                <ProductPublicEditor
                    visible={editorStatus}
                    productEntity={currentEntity}
                    handleCancel={handleCancel} handleSave={handleSave} /> : null}
        </div>
    }
}

const ProductListSearchFilter = ({ handleSubmit, loading }) => {
    const [form] = Form.useForm();
    const handleSearch = e => {
        e ? e.preventDefault() : null;
        form.validateFields((err, values) => {
            if (!err) {
                handleSubmit(values);
            }
        });
    };

    // const { getFieldDecorator } = form;
    return (
        <Form form={form} {...formItemLayout} onFinish={handleSearch}
        initialValues={{
            product_type_list : 1
        }}
        >
            <Row gutter={8}>
                <Col span={6} style={{ textAlign: 'left' }}>
                    <Form.Item label='商品名称' name="name">
                    <Input placeholder="商品名称" />
                        {/* {getFieldDecorator("name")(<Input placeholder="商品名称" />)} */}
                    </Form.Item>
                </Col>
                <Col span={6} >
                    <Form.Item label='商品类型' name="product_type_list" >
                            <Select>
                                <Select.Option value='1'>手机</Select.Option>
                                <Select.Option value='2'>配件</Select.Option>
                                <Select.Option value='3'>其它</Select.Option>
                            </Select>
                        {/* {getFieldDecorator("product_type_list", { initialValue: '1' })
                            (<Select >
                                <Select.Option value='1'>手机</Select.Option>
                                <Select.Option value='2'>配件</Select.Option>
                                <Select.Option value='3'>其它</Select.Option>
                            </Select>)} */}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label='商品名称'>
                        <Input placeholder="商品名称" />
                    </Form.Item>
                </Col>
                <Col span={6} >
                    <Button type="primary" htmlType="submit" style={{ marginTop: 6 }} loading={loading}>
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
const ProductPublicEditor = ({ productEntity, handleSave, handleCancel, visible }) => {
    const [form] = Form.useForm();
    const handleSubmit = values => {
        values.product_id = productEntity.id;
        handleSave(values);
    }

    const dataList = productEntity.product_public_list;
    // const { getFieldDecorator } = form;
    return (<Modal
        width={'80%'}
        title="商品上架"
        visible={visible}
        onOk={handleSubmit}
        onCancel={handleCancel} >
        <h3> {productEntity.name}</h3>
        <Divider />
        <Form form={form} {...formItemLayout} onFinish={handleSubmit} 
        initialValues={{
            color_id : "",
            spec_id : "",
            display_name : "",
            market_price : 0
        }}
        >

            <Form.Item label='上架颜色' name="color_id"
            rules={ [{
                required: true,
                message: "请选择上架颜色"
            }]}
            >
                    <Select>
                        {productEntity.product_color_list.map(item => <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>)}
                    </Select>
                {/* {getFieldDecorator("color_id", {
                    initialValue: '', rules: [{
                        required: true,
                        message: "请选择上架颜色"
                    }]
                })(
                    <Select>
                        {productEntity.product_color_list.map(item => <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>)}
                    </Select>
                )} */}
            </Form.Item>
            <Form.Item label='上架型号' name="spec_id">
                    <Select allowClear>
                        {productEntity.product_spec_list.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                    </Select>
                {/* {getFieldDecorator("spec_id", { initialValue: "" })(
                    <Select allowClear>
                        {productEntity.product_spec_list.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
                    </Select>
                )} */}
            </Form.Item>
            <Form.Item label='上架名称' name="display_name"
            rules={ [{
                required: true,
                message: "请输入上架名称"
            }]}
            >
                <Input placeholde='请输入上架名称'></Input>
                {/* {getFieldDecorator("display_name", {
                    initialValue: '', rules: [{
                        required: true,
                        message: "请输入上架名称"
                    }]
                })(<Input placeholde='请输入上架名称'></Input>)} */}
            </Form.Item>
            <Form.Item label='官方价' name="market_price">
            <InputNumber min={0}></InputNumber>
                {/* {getFieldDecorator("market_price", { initialValue: 0 })(<InputNumber min={0}></InputNumber>)} */}
            </Form.Item>

        </Form>
        {dataList.length > 0 ? <Table size='middle' dataSource={dataList} rowKey='id' pagination={false}>
            <Table.Column title='已上架机型' dataIndex='display_name' />
            <Table.Column title='官方价' dataIndex='market_price' />
            <Table.Column title='发布人' dataIndex='modified' />
            <Table.Column title='修改' dataIndex='id' render={(val, record) => {
                return <a onClick={(e) => {
                    e.preventDefault();
                    form.setFieldsValue({
                        display_name: record.display_name,
                        color_id: record.color_id,
                        spec_id: record.spec_id,
                        market_price: record.market_price,
                    })
                }}>修改</a>
            }} />
        </Table> : null}
    </Modal>
    )
}

// const ProductPublicEditorForm = Form.create({ name: 'product_edit' })(ProductPublicEditor);
// const ProductListSearch = Form.create({ name: 'product_search' })(ProductListSearchFilter);
export default ErpProductList;