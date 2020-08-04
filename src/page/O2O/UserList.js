import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    PageHeader,
    Card,
    Table,
    Input,
    Radio,
    Button,
    Modal,
    Select,
    Divider,
    Popconfirm,
    message,
    Form
} from "antd";
import LookupCustomer from '../../component/O2O/LookupCustomer';
import ViewPic from "../../component/O2O/ViewPic";
import { SingleImageUpload } from "../../component/O2O/ZksoftUpload";

@withRouter
@inject("o2oUserStore")
@observer
export default class UserList extends Component {
    constructor(props) {
        super(props)

        this.columns = [
            {
                title: '注册手机',
                width: 120,
                dataIndex: 'mobile',
                id: 'mobile',
            },
            {
                title: '商家名称',
                dataIndex: 'seller',
            },
            {
                title: '负责人',
                dataIndex: 'company_leader',
            },
            {
                title: '身份证',
                dataIndex: 'identity_card',
            },
            {
                title: '身份证照',
                render: record => {
                    return (
                        <div>
                            <a
                                onClick={() => this.props.o2oUserStore.showPhoto(record.id_card_font, record.id_card_back)}
                            >
                                查看
                      </a>
                        </div>
                    );
                },
            },
            {
                title: '注册时间',
                dataIndex: 'create_time',
            },
            {
                title: '收货人',
                width: 200,
                render: record => (
                    <span>
                        {record.address.linker ? record.address.linker : ''} <br />
                        {record.address.mobile} <br />
                        {record.address.province + ' ' + record.address.city + ' ' + record.address.town} <br />
                        {record.address.detail}
                        <div>
                            <a onClick={() => this.props.o2oUserStore.showPhoto(record.address.receipt_commission)}>
                                查看委托书
                            </a>
                        </div>
                        <div>
                            <Link to={{pathname: "/online/receipt/list", query: {mobile: record.mobile}}}>查看所有地址</Link>
                        </div>
                    </span>
                ),
            },
            {
                title: '客户类型',
                dataIndex: 'order_price_rule',
                render: val =>
                    val === "default" ? "默认" : val === "te_shu" ? "特殊" : val === "qu_dao" ? "渠道" : "未知"
            },
            {
                title: '营业执照',
                render: record => {
                    return (
                        <a onClick={() => this.props.o2oUserStore.showPhoto(record.business_licence)}>
                            查看
                    </a>
                    );
                },
            },
            {
                title: '门店照',
                dataIndex: 'store_licence',
                render: val => {
                    return val ? (
                        <a onClick={() => this.props.o2oUserStore.showPhoto(val)}>
                            查看
                    </a>
                    ) : '';
                },
            },
            {
                title: '审核人',
                dataIndex: 'auditor'
            },
            {
                title: '审核状态',
                dataIndex: 'status',
                render: val => (val ? (val === 2 ? '已通过' : '已禁用') : '待审核'),
            },
            {
                title: '操作',
                align: 'center',
                fixed: 'right',
                width: 140,
                render: record => (
                    <div>
                        <a onClick={() => this.props.o2oUserStore.handleReviewModal(record)}>
                            {record.status === 0 ? '审核' : '编辑'}&nbsp;&nbsp;
                        </a>
                        <Divider type='vertical' />
                        <Popconfirm
                            title="确认作废该用户信息吗？"
                            onConfirm={() => this.props.o2oUserStore.repealUser(record)}
                            okText="确认"
                            cancelText="取消">
                            <a href="#">作废</a>
                        </Popconfirm>

                    </div>
                ),
            }
        ]
    }

    componentDidMount = () => {
        this.props.o2oUserStore.fetch(this.props.o2oUserStore.filter)
    }

    componentWillUnmount = () => {
        this.props.o2oUserStore.resetData()
    }

    render() {
        const { data, page, pageSize, total, loading,
            photoVisible,
            reviewVisble,
            delUserVisible,
            photoUrl1,
            photoUrl2,
            oneRow,
            status,
            handlePageChange,
            handleStatusChange,
            showPhoto,
            handleAudit,
            exportReport,
            handleSearch } = this.props.o2oUserStore;
        return (
            <PageHeader>
                <Card title="用户审核">
                    <SearchCondition loading={loading} status={status} handleStatusChange={handleStatusChange} handleSearch={handleSearch} />
                </Card>
                <Card style={{ marginTop: 5 }}>
                    <div style={{ marginBottom: 10, textAlign: "right" }}>
                    <Button loading={loading} onClick={() => exportReport()}>导出</Button>
                    </div>
                    <Table
                        scroll={{ x: 1500 }}
                        rowKey="id"
                        columns={this.columns}
                        loading={loading}
                        dataSource={data}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            showQuickJumper: true,
                            total: total,
                            onChange: handlePageChange,
                        }}
                    />
                </Card>
                {photoVisible ? (
                    <PhotoModal
                        visible={photoVisible}
                        url1={photoUrl1}
                        url2={photoUrl2}
                        handleCancel={showPhoto}
                    />
                ) : null}

                {reviewVisble ? (
                    <ReviewModal
                        loading={loading}
                        visible={reviewVisble}
                        data={oneRow}
                        handleOk={handleAudit}
                        handleCancel={() => this.props.o2oUserStore.handleReviewModal(null)}
                    />
                ) : null}
                {delUserVisible ? (
                    <DelUserModal
                        loading={loading}
                        visible={delUserVisible}
                        data={oneRow}
                        handleOk={this.handleDel}
                        handleCancel={this.hideDelModal}
                    />
                ) : null}
            </PageHeader>
        )
    }
}

// 客户审核查询大栏
class SearchCondition extends Component {
    formRef = React.createRef();
    handleSubmit = values => {
        let params = {
            mobile: values.mobile,
            seller: values.seller,
        }
        this.props.handleSearch(params)
    };
    onChange = e => {
        this.props.handleStatusChange(e.target.value)
    };

    render() {
        // const { getFieldDecorator } = this.props.form;
        const { status, loading } = this.props;
        return (
            <Form ref={this.formRef} onFinish={this.handleSubmit} layout="inline">
                <Form.Item label="手机号码" name="mobile">
                <Input autoComplete='off' placeholder="手机号码" />
                    {/* {getFieldDecorator('mobile')(<Input autoComplete='off' placeholder="手机号码" />)} */}
                </Form.Item>
                <Form.Item label="名称" name="seller">
                <Input autoComplete='off' placeholder="商家名称" />
                    {/* {getFieldDecorator('seller')(<Input autoComplete='off' placeholder="商家名称" />)} */}
                </Form.Item>
                <Form.Item>
                    <Radio.Group
                        disabled={loading}
                        defaultValue={status}
                        buttonStyle="solid"
                        onChange={this.onChange}
                    >
                        <Radio.Button value={0}>未审核</Radio.Button>
                        <Radio.Button value={2}>已审核</Radio.Button>
                    </Radio.Group>
                </Form.Item>
                <Form.Item>
                    <Button
                        loading={this.props.loading}
                        style={{ float: 'right' }}
                        htmlType="submit"
                        type="primary"
                        icon={<SearchOutlined />}
                    >
                        查询
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

class PhotoModal extends Component {
    render() {
        const { visible, url1, url2, handleOk, handleCancel } = this.props;
        return (
            <Modal
                width="100%"
                style={{ maxWidth: '50%' }}
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
                centered={true}
            >
                <ViewPic picUrl={url1}></ViewPic>
                {url2 && <span><Divider /><ViewPic picUrl={url2}></ViewPic></span>}
            </Modal>
        );
    }
}

// 客户审核的编辑操作
class ReviewModal extends Component {
    formRef = React.createRef();

    handleOk = () => {
        
        this.formRef.current.validateFields().then(values => {
            if (!values.id_card_font || !values.id_card_back || !values.business_licence) {
                message.warn('请上传身份证照和营业执照');
                return;
            }

            values.bind_customer_id = values.customer_id.id ? values.customer_id.id : values.customer_id;
            const data = { ...values };
            data.id = this.props.data.id; // 用户的id
            this.props.handleOk(data);
           
        });
    };
    
    render() {
        // const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const { visible, handleCancel, data, loading } = this.props;
        return (
            <Modal
                width={600}
                visible={visible}
                onOk={this.handleOk}
                onCancel={handleCancel}
                closable={false}
                confirmLoading={loading}
            >
                <Form ref={this.formRef}
                initialValues={
                    {
                        seller : data.seller,
                        company_leader : data.company_leader,
                        customer_id : data.bind_customer_id != 0 ? data.bind_customer_id : null,
                        order_price_rule : data ? data.order_price_rule : null,
                        business_licence : data.business_licence,
                        store_licence : data.store_licence,
                        id_card_font : data.id_card_font,
                        id_card_back : data.id_card_back,
                        status : data.status == 0 ? null : data.status,
                    }
                }
                >
                    <Form.Item label="商家名称" {...formItemLayout} name="seller"
                    rules={ [
                        {
                            required: true,
                            message: '请输入商家名称',
                        }
                    ] }
                    >
                    <Input />
                        {/* {getFieldDecorator('seller', {
                            initialValue: data.seller,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入商家名称',
                                },
                            ],
                        })(<Input />)} */}
                    </Form.Item>
                    <Form.Item label="商家负责人" {...formItemLayout} name="company_leader"
                    rules={[
                        {
                            required: true,
                            message: '请输入商家负责人',
                        }
                    ]}
                    >
                    <Input />
                        {/* {getFieldDecorator('company_leader', {
                            initialValue: data.company_leader,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入商家负责人',
                                },
                            ],
                        })(<Input />)} */}
                    </Form.Item>
                    <Form.Item label="绑定客户" {...formItemLayout} name="customer_id"
                    rules={[
                        {
                            required: true,
                            message: '请选择绑定客户',
                        }
                    ]}
                    >
                    <LookupCustomer defaultId={data.bind_customer_id} width={368} />
                        {/* {getFieldDecorator('customer_id', {
                            initialValue: data.bind_customer_id != 0 ? data.bind_customer_id : null,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择绑定客户',
                                },
                            ],
                        })(
                            <LookupCustomer defaultId={data.bind_customer_id} width={368} />
                        )} */}
                    </Form.Item>
                    <Form.Item label="售价类型" {...formItemLayout} name="order_price_rule"
                    rules={[
                        {
                            required: true,
                            message: '请选择售价类型',
                        }
                    ]}
                    >
                            <Select>
                                <Select.Option value="default">默认</Select.Option>
                                <Select.Option value="qu_dao">渠道</Select.Option>
                                <Select.Option value="te_shu">特殊</Select.Option>
                            </Select>
                        {/* {getFieldDecorator('order_price_rule', {
                            initialValue: data ? data.order_price_rule : null,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择售价类型',
                                },
                            ],
                        })(
                            <Select>
                                <Select.Option value="default">默认</Select.Option>
                                <Select.Option value="qu_dao">渠道</Select.Option>
                                <Select.Option value="te_shu">特殊</Select.Option>
                            </Select>
                        )} */}
                    </Form.Item>
                    <Form.Item label="营业执照" {...formItemLayout} name="business_licence">
                    <SingleImageUpload />
                        {/* {getFieldDecorator('business_licence', {
                            initialValue: data.business_licence,
                        })(
                            <SingleImageUpload />
                        )} */}
                    </Form.Item>
                    <Form.Item label="门店照" {...formItemLayout} name="store_licence">
                    <SingleImageUpload />
                        {/* {getFieldDecorator('store_licence', {
                            initialValue: data.store_licence,
                        })(
                            <SingleImageUpload />
                        )} */}
                    </Form.Item>
                    <Form.Item label="身份证照" {...formItemLayout}>
                    <Form.Item name="id_card_font">
                          <SingleImageUpload />
                    </Form.Item >
                    <Form.Item name="id_card_back">
                        <SingleImageUpload />
                    </Form.Item>
                        {/* {getFieldDecorator('id_card_font', {
                            initialValue: data.id_card_font,
                        })(
                            <SingleImageUpload />
                        )}
                        {getFieldDecorator('id_card_back', {
                            initialValue: data.id_card_back,
                        })(
                            <SingleImageUpload />
                        )} */}
                    </Form.Item>
                    <Form.Item label="审核结果" {...formItemLayout} name="status"
                    rules={ [
                        {
                            required: true,
                            message: '请选择审核状态',
                        }
                    ] }
                    >
                            <Radio.Group>
                                <Radio.Button value={4}>禁用</Radio.Button>
                                <Radio.Button value={2}>通过</Radio.Button>
                            </Radio.Group>
                        {/* {getFieldDecorator('status', {
                            initialValue: data.status == 0 ? null : data.status,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择审核状态',
                                },
                            ],
                        })(
                            <Radio.Group>
                                <Radio.Button value={4}>禁用</Radio.Button>
                                <Radio.Button value={2}>通过</Radio.Button>
                            </Radio.Group>
                        )} */}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}