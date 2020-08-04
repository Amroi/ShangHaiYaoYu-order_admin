import React from 'react';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Table,
    Tag,
    Divider,
    Popconfirm,
    Modal,
    Button,
    message,
    DatePicker,
    Row,
    Col,
    Form
} from 'antd';
import ajax from '../../../util/api/ajax';
import moment from 'moment';
import ViewPic from '../../../component/O2O/ViewPic';
import LookupCustomer from '../../../component/O2O/LookupCustomer';
import { stringify } from 'qs';
import { SearchOutlined } from '@ant-design/icons';

// 客户账本查询大栏
class ConditionFilter extends React.PureComponent {
    formRef = React.createRef();

    onFinish = (e) => {
        e ? e.preventDefault() : null;
        const filter = {};
        const create_date = this.formRef.current.getFieldValue('create_date');
        filter.creatDate = create_date && create_date.format('YYYY-MM');
        const customer = this.formRef.current.getFieldValue('customer');
        filter.customerId = 0;
        if (customer && customer.id) {
            filter.customerId = customer.id;
        }
        this.props.handleSearch(filter);
    };

    render() {
        const { loading } = this.props;
        // const { getFieldDecorator } = this.props.form;
        return <div>
            <Form ref={this.formRef} layout='inline' onFinish={this.onFinish}
                initialValues={{ create_date : moment() }}>
                    
                        <Form.Item label='对账日期' name="create_date">
                            <DatePicker.MonthPicker  style={{width : 280}} />
                            {/* {getFieldDecorator("create_date", { initialValue: moment() })(<DatePicker.MonthPicker />)} */}
                        </Form.Item>
                    
                        <Form.Item label='客户名称' name="customer" style={{ marginLeft: '24px' }}>
                            <LookupCustomer width={240} />
                            {/* {getFieldDecorator("customer")(<LookupCustomer width={240} />)} */}
                        </Form.Item>
                    
                        <Form.Item>
                            <Button onClick={this.onFinish} htmlType='submit' style={{ marginLeft: '24px' }} type='primary' loading={loading}  icon={<SearchOutlined />}>查询</Button>
                        </Form.Item>
                    
            </Form>
        </div>
    }
}

class PhotoModal extends React.PureComponent {
    download = () => {
        const blob = this.getBlob(this.props.data);
        this.getFileType(this.props.data)
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (e) => {
            const a = document.createElement('a');
            a.download = this.props.bookTitle + `_确认函.` + this.getFileType(this.props.data);
            a.href = e.target.result;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    getBlob(base64) {
        return this.b64toBlob(this.getData(base64), this.getContentType(base64));
    };

    getFileType(base64) {
        const str = this.getContentType(base64);
        const idx = str.indexOf('/');
        if (idx > -1) {
            return str.substring(idx + 1);
        }
        return '';
    }

    getContentType(base64) {
        return /data:([^;]*);/i.exec(base64)[1];
    };

    getData(base64) {
        return base64.substr(base64.indexOf("base64,") + 7, base64.length);
    }

    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    render() {
        const { visible, handleCancel, data, loading } = this.props;
        return (
            <Modal
                title={<span>预览<Button type='primary' style={{ float: 'right', marginRight: 30 }} onClick={() => this.download()}>下载</Button></span>}
                width="100%"
                confirmLoading={loading}
                style={{ maxWidth: '50%' }}
                visible={visible}
                onCancel={handleCancel}
                footer={null}
                centered={true}
            >
                <ViewPic src={data} />
            </Modal>
        );
    }
}

class PDFPreviewer extends React.PureComponent {
    render() {
        const { visible, data, loading } = this.props;
        return <Modal
            confirmLoading={loading}
            title="预览（如无法预览，请下载到本地查看）"
            width='84%'
            style={{ height: '100%' }}
            bodyStyle={{ height: '100%' }}
            centered
            maskClosable={false}
            footer={null}
            visible={visible} onCancel={this.props.hidePDFViewer}>
            <iframe width='100%' height={window.innerHeight} src={data} />
        </Modal>
    }
}

class BookList extends React.Component {
    state = {
        loading: false,
        visible: false,
        picVisible: false,
        fileStream: null,
        picBlob: null,
        dataList: [],
        bookTitle: "",
        selectedRowKeys: [],
        filter: {},
    };

    componentDidMount() {
        this.fetchList();
    };

    componentWillUnmount = () => {
        this.setState({
            loading: false,
            visible: false,
            fileStream: null,
            dataList: [],
            bookTitle: '',
            filter: {},
        })
    };

    setLoading = (val) => {
        this.setState({
            loading: val,
        })
    };

    fetchList = async (params) => {
        this.setLoading(true);
        const filter = {
            ...this.state.filter,
            ...params,
        }
        this.setState({
            filter: { ...filter },
        })
        try {
            const resp = await ajax({ url: `/erp/o2o/book/list?` + stringify(filter) });
            if (resp && resp.success) {
                this.setState({
                    dataList: resp.data,
                    selectedRowKeys: [],
                })
            }
        } finally {
            this.setLoading(false);
        }
    };

    // 预览确认函
    previewConfirmation = (id, name) => {
        this.setLoading(true);
        try {
            let reader = new FileReader();
            this.fetchConfirmation(id).then(function (blob) {
                if (!blob || !blob.size) {
                    return
                }
                reader.readAsDataURL(blob);
            });
            let that = this;
            reader.onload = function (e) {
                that.setState({
                    picVisible: true,
                    bookTitle: name,
                    fileStream: e.target.result,
                });
            }
        } finally {
            this.setLoading(false);
        }
    }

    // 预览对账单
    previewBookFile = (id) => {
        this.setLoading(true);
        try {
            let reader = new FileReader();
            this.fetachFileStream(id).then(function (blob) {
                if (!blob || !blob.size) {
                    return
                }
                reader.readAsDataURL(blob);
            });
            let that = this;
            reader.onload = function (e) {
                that.setState({
                    visible: true,
                    fileStream: e.target.result,
                });
            }
        } finally {
            this.setLoading(false);
        }
    };

    // 下载对账单
    downloadBookFile = async (id, name) => {
        this.setLoading(true);
        try {
            const data = await this.fetachFileStream(id);
            if (!data || !data.size) {
                return
            }
            const elink = document.createElement('a')
            if (name) {
                elink.download = name + '.pdf';
            } else {
                elink.download = '对账单.pdf';
            }
            elink.style.display = 'none';
            elink.href = URL.createObjectURL(data);
            document.body.appendChild(elink);
            elink.click();
            URL.revokeObjectURL(elink.href); // 释放 URL 对象
            document.body.removeChild(elink);
        } finally {
            this.setLoading(false);
        }
    };

    // 获取客户确认函
    fetchConfirmation = async (id) => {
        const resp = await ajax({ url: `/erp/o2o/book/confirmation/download/` + id + '?timestamp=' + new Date().getTime(), responseType: 'blob', resolveWithFullResponse: true });
        if (resp) {
            return resp;
        };
    };

    // 获取对账单数据
    fetachFileStream = async (id) => {
        const resp = await ajax({ url: `/erp/o2o/customer/book/download/` + id + '?timestamp=' + new Date().getTime(), responseType: 'blob', resolveWithFullResponse: true });
        if (resp) {
            return resp;
        };
    };

    handleComfirm = async () => {
        const { selectedRowKeys } = this.state;
        if (!selectedRowKeys || selectedRowKeys.length === 0) {
            message.destroy();
            message.info('提交数据不能为空');
            return;
        }
        this.setLoading(true);
        try {
            const resp = await ajax({ url: `/erp/o2o/book/confirm`, data: { ids: selectedRowKeys }, method: 'POST' });
            if (resp) {
                if (resp.success) {
                    message.success(resp.msg);
                    this.fetchList();
                } else {
                    message.warn(resp.msg);
                }
                return
            }
            message.error('调用接口失败');
        } finally {
            this.setLoading(false);
        }
    }

    hidePDFViewer = () => {
        this.setState({
            visible: false,
        })
    }

    columns = [
        {
            title: "账单名称",
            dataIndex: 'book_title',
            width: 350,
        },
        {
            title: '客户名称',
            dataIndex: 'customer',
            width: 200
        },
        {
            title: '状态',
            width: 100,
            align: 'center',
            render: (_, record) => <span>{record.confirm_status === 0 ? <Tag color='orange'>待确认</Tag> :
                record.confirm_status === 1 ? <Tag color='blue'>已确认</Tag> : <Tag color='green'>完成</Tag>}</span>
        },
        {
            title: '对账人',
            width: 100,
            align: 'center',
            dataIndex: 'creator',
        },
        {
            title: '对账时间',
            width: 200,
            align: 'center',
            dataIndex: 'create_at',
        },
        {
            title: '确认人',
            width: 100,
            dataIndex: 'confirm_user',
        },
        {
            title: '确认时间',
            width: 200,
            align: 'center',
            dataIndex: 'confirm_at',
        },
        {
            title: '操作',
            width: 240,
            align: 'center',
            fixed: 'right',
            render: (_, record) => <span><a title='预览对账单' onClick={() => this.previewBookFile(record.id)}>预览</a>
                <Divider type='vertical' />
                <a title='下载对账单' onClick={() => this.downloadBookFile(record.id, record.book_title)}>下载</a>
                <Divider type='vertical' />
                <a disabled={!record.need_return} onClick={() => this.previewConfirmation(record.id, record.book_title)}>查看确认函</a>
                {/* <Divider type='vertical' />
                <Popconfirm
                    title="是否确认账单正确？"
                    onConfirm={() => this.handleComfirm(record.id)}
                    okText="确认"
                    cancelText="取消"
                >
                    <a disabled={record.confirm_status !== 1} href="#">审核</a>
                </Popconfirm> */}
            </span>
        }
    ]

    render() {
        const { dataList, loading, visible, fileStream, picVisible, bookTitle, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(selectedRowKeys);
                this.setState({
                    selectedRowKeys: selectedRowKeys,
                })
            },
            getCheckboxProps: record => ({
                disabled: record.confirm_status !== 1
            })
        };
        return <div>
            <Card title="客户对账单">
                <ConditionFilter loading={loading}
                    handleSearch={this.fetchList} />
            </Card>
            <Card>
                {selectedRowKeys.length ? <Popconfirm
                    title="是否确认账单正确？"
                    onConfirm={this.handleComfirm}
                    okText="确认"
                    cancelText="取消"
                >
                    <Button type="primary"
                        // onClick={}
                        style={{ margin: 5 }} loading={this.state.loading}>确认({selectedRowKeys.length})</Button>
                    {/* <a disabled={record.confirm_status !== 1} href="#">审核</a> */}
                </Popconfirm> : null}
                <Table
                    rowSelection={rowSelection}
                    rowKey='id'
                    dataSource={dataList}
                    loading={loading}
                    scroll={{ x: 1300 }}
                    columns={this.columns}
                />
            </Card>
            {visible && <PDFPreviewer loading={loading} hidePDFViewer={this.hidePDFViewer} visible={visible} data={fileStream} />}
            {picVisible && <PhotoModal loading={loading} visible={picVisible} bookTitle={bookTitle} data={fileStream} handleCancel={() => this.setState({ picVisible: false, fileStream: null, bookTitle: '' })} />}
        </div>
    }
}

export default BookList;