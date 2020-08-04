import React from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Table,
    Button,
    Divider,
    Modal,
    Input,
    Tag,
    message,
    Select,
    Row,
    Col,
    DatePicker,
    Form
} from 'antd';
import LookupCustomerType from '../../component/O2O/LookupCustomerType';
import { SingleImageUpload } from '../../component/O2O/ZksoftUpload';

@withRouter
@inject("noticeStore")
@observer
class NoticeManager extends React.Component {
    columns = [
        {
            title: '通知编号',
            dataIndex: "code",
            width: '20%',
        },
        {
            title: '标题',
            dataIndex: "title",
            width: '20%',
            align: 'center'
        },
        {
            title: '创建时间',
            dataIndex: "create_at",
            align: 'center',
        },
        {
            title: '创建人',
            dataIndex: "creator",
            align: 'center',
        },
        {
            title: '最后更新时间',
            dataIndex: "update_at",
            align: 'center',
        },
        {
            title: '更新人',
            dataIndex: "updater",
            align: 'center',
        },
        {
            title: '操作',
            align: 'center',
            render: (_, record) => {
                return <div>
                    <a onClick={() => this.props.noticeStore.handleEdit(record)}>编辑</a>
                    <Divider type='vertical' />
                    <a onClick={() => this.props.noticeStore.changeDelVisible(true, record)}>删除</a>
                </div>
            }
        },
    ]

    componentDidMount = () => {
        const { filter } = this.props.noticeStore;
        filter.page = 1;
        filter.pageSize = 10;
        this.props.noticeStore.fetch(filter);
    }

    render() {
        const { loading, data, page, pageSize, total, editVisible,
            changeEditVisible, handleEdit, editData,
            submit, handlePageChange,
            deleteVisible, delData, changeDelVisible, handleDelete } = this.props.noticeStore;
        return (
            <div>
                <Card title="通知管理">
                    <SearchCondition />
                </Card>
                <Card style={{ marginTop: 10 }}>
                    <Button type='primary' style={{ marginBottom: 5 }} onClick={() => handleEdit()}>新建</Button>
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={this.columns}
                        dataSource={data}
                        pagination={{ current: page, showQuickJumper: false, pageSize: pageSize, total: total, onChange: handlePageChange }}
                    />
                </Card>
                {editVisible && <EditModal loading={loading} visible={editVisible} changeVisible={changeEditVisible} data={editData} submit={submit} />}
                {deleteVisible && <DelModal loading={loading} visible={deleteVisible} changeVisible={changeDelVisible} data={delData} handleDelete={handleDelete} />}
            </div>
        )
    }
}

// 查询条件
class SearchCondition extends React.PureComponent {
    state = {
        params: {}
    }
    render() {
        return <div>
            <Form>
            <Row gutter={16}>
                <Col span={6}><Form.Item>标题：<Input autoComplete="off" style={{ maxWidth: 240}} /></Form.Item></Col>
                <Col span={9}><Form.Item>创建时间：<DatePicker.RangePicker /></Form.Item></Col>
                <Col span={1}><Form.Item><Button type="primary" htmlType="submit">查询</Button></Form.Item></Col>
            </Row>
            </Form>
        </div>
    }
}

// 编辑框
class DelModal extends React.PureComponent {
    render() {
        const { data, handleDelete, changeVisible, visible, loading } = this.props;
        return (
            <Modal
                visible={visible}
                confirmLoading={loading}
                title='删除'
                onOk={() => handleDelete(data.id)}
                onCancel={() => changeVisible(false)}
            >
                是否删除通知[{data.title}]?
            </Modal>
        )
    }
}

@Form.create()
class EditModal extends React.PureComponent {

    state = {
        editData: {},
    }

    componentDidMount = () => {
        const { data } = this.props;
        this.setState({
            editData: { ...data },
        })
    }

    handleSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return
            }
            if (!values.title || values.title.trim() === '') {
                message.warn('标题不能为空')
                return
            }
            if (!values.contents || values.contents.trim() === '') {
                message.warn('通知内容不能为空')
                return
            }
            if (values.typ === 2 && (!values.customer_type_list || values.customer_type_list.length === 0)) {
                message.warn('请选择通知的客户类型')
                return
            }
            let newList = new Array();
            for (let idx in values.customer_type_list) {
                let d = {
                    bind_id: values.customer_type_list[idx].id,
                    bind_name: values.customer_type_list[idx].name,
                }
                newList.push(d);
            }
            values.customer_type_list = newList;

            this.props.submit(values);
        })
    }

    render() {
        const { visible, changeVisible, loading, data } = this.props;
        // const { getFieldDecorator } = this.props.form;
        const [form] = Form.useForm(); 
        let noticeCustomer = new Array();
        const { editData } = this.state;
        if (data) {
            for (let idx in data.customer_type_list) {
                let p = { id: data.customer_type_list[idx].bind_id, name: data.customer_type_list[idx].bind_name };
                noticeCustomer.push(p);
            }
        }
        return <Modal
                confirmLoading={loading}
                visible={visible}
                onOk={this.handleSubmit}
                onCancel={() => changeVisible(false)}
                width='50%'
            >
                <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
                    <Form.Item name="id">
                        {/* {getFieldDecorator('id',
                        { initialValue: editData.id && editData.id })(<Input style={{ display: 'none' }} />)} */}
                    </Form.Item>
                    <Form.Item label='标题' name="title" required>
                        {/* {getFieldDecorator('title', {
                            initialValue: editData.title && editData.title
                        })(<Input placeholder='请输入标题' />)} */}
                    </Form.Item>
                    <Form.Item label='内容' name="contents" required>
                        {/* {getFieldDecorator('contents', {
                            initialValue: editData.contents && editData.contents
                        })(<Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} placeholder='请输入通知内容' />)} */}
                    </Form.Item>
                    <Form.Item label="附件" name="attachment">
                        {/* {getFieldDecorator("attachment", { initialValue: editData.attachment && editData.attachment })(<SingleImageUpload />)} */}
                    </Form.Item>
                    <Form.Item label='类型' name="typ" required>
                        {/* {getFieldDecorator('typ', {
                            initialValue: editData.typ ? editData.typ : 1
                        })(<Select onSelect={(e) => { this.setState({ editData: { ...editData, typ: e }}) }}>
                            <Select.Option key={1} value={1}>所有客户</Select.Option>
                            <Select.Option key={2} value={2}>按客户类型</Select.Option>
                        </Select>)} */}
                    </Form.Item>
                    {editData.typ === 2 && <Form.Item label='通知客户' name="customer_type_list" required>
                        {/* {getFieldDecorator('customer_type_list', {
                            initialValue: noticeCustomer,
                        })(<LookupCustomerType defaultVal={noticeCustomer} />)} */}
                    </Form.Item>}
                </Form>
            </Modal>
    }
}

export default NoticeManager;