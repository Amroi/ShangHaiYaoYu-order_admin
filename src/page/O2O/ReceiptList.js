import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Table,
    Tag,
    Modal,
    Button,
    Divider,
    Popconfirm,
    Select,
    Input,
    Radio,
    message,
    Cascader,
    Form
} from 'antd';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import AreaList from '../../component/AreaList';
import LookupCustomer from '../../component/O2O/LookupCustomer';
import ViewPic from '../../component/O2O/ViewPic';
import { SingleImageUpload } from '../../component/O2O/ZksoftUpload';

@withRouter
@inject("o2oReceiptAddrStore")
@observer
class ReceiptList extends React.Component {
    columns = [
        {
            title: "客户名称",
            dataIndex: "seller",
            align: 'center',
            width: 200,
        },
        {
            title: "手机号码",
            dataIndex: "mobile",
            align: 'center',
            width: 130,
        },
        {
            title: '省份',
            align: 'center',
            dataIndex: 'province',
            width: 100,
        },
        {
            title: '城市',
            align: 'center',
            dataIndex: 'city',
            width: 140,
        },
        {
            title: '镇区',
            align: 'center',
            dataIndex: 'town',
            width: 140,
        },
        {
            title: '详细地址',
            dataIndex: 'detail',
            width: 260,
        },
        {
            title: '收货委托书',
            align: 'center',
            width: 120,
            render: record => (
                <a onClick={() => this.props.o2oReceiptAddrStore.showPhoto(record.receipt_commission)}>查看</a>
            )
        },
        {
            title: "申请时间",
            align: "center",
            dataIndex: "create_time",
            width: 120,
        },

        {
            title: "审核人",
            align: "center",
            dataIndex: "auditor",
            width: 100,
        },

        {
            title: "审核时间",
            align: "center",
            dataIndex: "audit_time",
            width: 120,
        },
        {
            title: "状态",
            align: 'center',
            width: 80,
            render: record => (
                <div>
                    {record.status === 1 ? <Tag color='red'>禁用</Tag> : record.status === 2 ? <Tag color='green'>通过</Tag> : <Tag color='blue'>未审核</Tag>}
                </div>
            )
        },
        {
            title: "操作",
            align: 'center',
            fixed: 'right',
            width: 160,
            render: (_, record) => (
                <div>
                    <a onClick={() => this.props.o2oReceiptAddrStore.showEditModal(record)}>审核</a>
                    {record.status === 2 && <span><Divider type='vertical' />
                        <a title='同步到 ERP 收货地址' onClick={() => this.props.o2oReceiptAddrStore.syncToErp(record.id)}>同步</a></span>}

                    <Divider type='vertical' />
                    <Popconfirm
                        title="确认删除该收货地址？"
                        onConfirm={() => this.props.o2oReceiptAddrStore.deleteReceiptAddr(record.id)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <a href="#">删除</a>
                    </Popconfirm>
                </div>
            )
        }
    ]

    componentDidMount = () => {
        this.props.o2oReceiptAddrStore.filter = {};
        let params = {
            ...this.props.o2oReceiptAddrStore.filter,
            page: 1,
            pageSize: 10
        }
        const mobile = this.props.location.query ? this.props.location.query.mobile : 0;
        if (mobile) {
            params.mobile = mobile;
            params.status = 9;
            this.props.o2oReceiptAddrStore.status = 9;
        } else {
            this.props.o2oReceiptAddrStore.status = 0;
        }
        this.props.o2oReceiptAddrStore.fetch(params);
    }

    render() {
        const { data, total, page, pageSize, loading, handlePageChange, photoVisible, audit, status,
            photoUrl, showPhoto, handleSearch, editData, editVisible, showEditModal } = this.props.o2oReceiptAddrStore;
        return (
            <div>
                <Card title="收货地址审核">
                    <SearchCondition loading={loading} handleSearch={handleSearch} status={status} />
                </Card>

                <Card style={{ marginTop: 5 }}>
                    <Table
                        scroll={{ x: 1500 }}
                        rowKey={'id'}
                        loading={loading}
                        columns={this.columns}
                        dataSource={data}
                        pagination={{ current: page, showQuickJumper: false, pageSize: pageSize, total: total, onChange: handlePageChange }}
                    />
                </Card>
                {photoVisible ? (
                    <PhotoModal
                        visible={photoVisible}
                        url={photoUrl}
                        handleCancel={showPhoto}
                    />
                ) : null}
                {editVisible ? <EditModal loading={loading} visible={editVisible} showEditModal={showEditModal} editData={editData} handleAudit={audit} /> : null}
            </div>
        )
    }
}

// 收货地址的审核功能
class EditModal extends React.PureComponent {
    formRef = React.createRef();
    handleSubmit = () => {
        this.formRef.current.validateFields().then(values => {
            // if (!values.seller || values.seller.trim() === '') {
            //     message.warn('客户名称不能为空');
            //     return
            // }
            if (!values.area || values.area.length != 3) {
                message.warn("区域地址错误")
                return
            }
            if (!values.receipt_commission || values.receipt_commission.trim() === '') {
                message.warn('收货委托书不能为空');
                return
            }
            if (!values.status) {
                message.warn("请选择审核状态");
                return;
            }
            values.province = values.area[0];
            values.city = values.area[1];
            values.town = values.area[2];
            delete values.area;
            this.props.handleAudit(values);
        });
    }
    render() {
        // const { getFieldDecorator } = this.props.form;
        const { visible, showEditModal, editData, loading } = this.props;
        let area = new Array();
        area.push(editData.province, editData.city, editData.town);
        return <Modal
            style={{ maxWidth: '60%' }}
            title="审核"
            confirmLoading={loading}
            onOk={this.handleSubmit}
            visible={visible}
            onCancel={() => showEditModal(null)}
            centered={true}
            // footer={null}
            destroyOnClose={true}
        >
            <Form ref={this.formRef} layout='horizontal' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
                initialValues={{
                    id: editData.id,
                    mobile: editData.mobile,
                    area: area,
                    detail: editData.detail,
                    receipt_commission: editData.receipt_commission,
                    status: editData.status
                }}
            >
                <Form.Item style={{ display: 'none' }} name="id">
                    {/* {getFieldDecorator('id', {initialValue: editData.id})} */}
                </Form.Item>
                <Form.Item label='客户名称'>
                    <Input readOnly autoComplete='off' defaultValue={editData.seller} />
                </Form.Item>
                <Form.Item label='联系人'>
                    <Input readOnly autoComplete='off' defaultValue={editData.linker} />
                </Form.Item>
                <Form.Item label='手机号码' name="mobile">
                    <Input defaultValue={editData.mobile} />
                    {/* {getFieldDecorator("mobile", {
                        initialValue: editData.mobile,
                    })(<Input defaultValue={editData.mobile} />)} */}
                </Form.Item>
                <Form.Item label="区域" name="area" rules={[
                    {
                        type: 'array',
                        required: true,
                        message: '请选择地区!'
                    }
                ]}>
                    <Cascader options={AreaList} placeholder="请选择区域" />
                    {/* {getFieldDecorator('area', {
                        initialValue: area,
                        rules: [{ type: 'array', required: true, message: '请选择地区!' }],
                    })(<Cascader options={AreaList} placeholder="请选择区域" />)} */}
                </Form.Item>
                <Form.Item label="详细地址" name="detail">
                    <Input defaultValue={editData.detail} />
                    {/* {getFieldDecorator('detail', {
                        initialValue: editData.detail,
                    })(
                        <Input defaultValue={editData.detail} />
                    )} */}
                </Form.Item>
                <Form.Item label="收货委托书" name="receipt_commission">
                    <SingleImageUpload />
                    {/* {getFieldDecorator('receipt_commission', {
                        initialValue: editData.receipt_commission,
                    })(
                        <SingleImageUpload />
                    )} */}
                </Form.Item>
                <Form.Item label="状态" name="status"
                    rules={[
                        {
                            required: true,
                            message: '请选择审核状态',
                        }
                    ]}>
                    <Radio.Group>
                        <Radio.Button value={2}>通过</Radio.Button>
                        <Radio.Button value={1}>禁用</Radio.Button>
                    </Radio.Group>
                    {/* {getFieldDecorator('status', {
                        initialValue: editData.status,
                        rules: [
                            {
                                required: true,
                                message: '请选择审核状态',
                            },
                        ],
                    })(
                        <Radio.Group>
                            <Radio.Button value={2}>通过</Radio.Button>
                            <Radio.Button value={1}>禁用</Radio.Button>
                        </Radio.Group>
                    )} */}
                </Form.Item>
            </Form>
        </Modal>
    }
}

// 收货地址审核的查询大栏
class SearchCondition extends React.PureComponent {
    formRef = React.createRef();

    handleSubmit = values => {
        values.customer_id = values.customer_id ? values.customer_id.id : 0;
        this.props.handleSearch(values)
    };

    render() {
        // const { getFieldDecorator } = this.props.form;

        const { loading, status } = this.props;
        return (
            <Form ref={this.formRef} onFinish={this.handleSubmit} layout="inline">
                <Form.Item label='客户' name="customer_id">
                    <LookupCustomer width={250}/>
                    {/* {getFieldDecorator("customer_id")(<LookupCustomer />)} */}
                </Form.Item>
                <Form.Item label='手机号码' name="mobile">
                    <Input autoComplete='off' />
                    {/* {getFieldDecorator('mobile')(
                        <Input autoComplete='off' />
                    )} */}
                </Form.Item>
                <Form.Item label='状态' name="status" initialValue={status}>
                    <Select style={{ width: 100 }}>
                        <Select.Option value={9}>所有</Select.Option>
                        <Select.Option value={0}>未审核</Select.Option>
                        <Select.Option value={2}>通过</Select.Option>
                        <Select.Option value={1}>禁用</Select.Option>
                    </Select>
                    {/* {getFieldDecorator('status', {
                        initialValue: status
                    })(
                        <Select style={{ width: 100 }}>
                            <Select.Option value={9}>所有</Select.Option>
                            <Select.Option value={0}>未审核</Select.Option>
                            <Select.Option value={2}>通过</Select.Option>
                            <Select.Option value={1}>禁用</Select.Option>
                        </Select>
                    )} */}
                </Form.Item>
                <Form.Item>
                    <Button
                        loading={loading}
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

class PhotoModal extends React.PureComponent {
    render() {
        const { visible, url, handleCancel } = this.props;
        return (
            <Modal
                width="100%"
                style={{ maxWidth: '50%' }}
                visible={visible}
                onCancel={handleCancel}
                footer={null}
                centered={true}
            >
                <ViewPic picUrl={url} />
            </Modal>
        );
    }
}

export default ReceiptList;