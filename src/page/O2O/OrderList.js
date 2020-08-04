import React, { Component, useState } from "react";
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { CheckCircleTwoTone ,SearchOutlined } from '@ant-design/icons';
// import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Table,
    Select,
    Input,
    DatePicker,
    Badge,
    Button,
    Descriptions,
    Drawer,
    InputNumber,
    Steps,
    Modal,
    Row,
    Col,
    Timeline,
    Form
} from 'antd';
import LookupCustomer from '../../component/O2O/LookupCustomer';
import LookupWarehouse from "../../component/O2O/LookupWarehouse"
import styles from './OrderList.less';

const { RangePicker } = DatePicker;
const Step = Steps.Step;

@withRouter
@inject("o2oOrderStore")
@observer
export default class OrderList extends Component {
    state = {
        showOrderDetail: false,
        entity: null,
    }

    componentDidMount = () => {
        let queryParams = {
            start_time: moment().subtract(7, 'days').unix(),
            end_time: moment().unix(),
        }
        this.props.o2oOrderStore.load(queryParams);
    }

    render() {
        const { updateItemPrice,
            showEditor, hideEditor,
            editorStatus, handleExport,
            currentEntity, loading,
            warehouse_id, location_id,
            showResonVisible, handleCancelOrder, resonVisible,
            logisticsVisible, logisticsInfo, changeLogisticsVisible,
            createErpSaleOrder, dataList, load, page_size, page, total, onPageChange, selectWarehouse, showLogisticsRouter } = this.props.o2oOrderStore;
        return (<div>
            {resonVisible && <CancelOrderModal loading={loading}
                handleCancelOrder={handleCancelOrder}
                visible={resonVisible}
                onCancel={showResonVisible} />}
            {logisticsVisible && <LogisticsRouterModal visible={logisticsVisible} data={logisticsInfo} onCancel={changeLogisticsVisible}></LogisticsRouterModal>}
            {editorStatus ?
                <OrderDetail
                    showResonVisible={showResonVisible}
                    selectWarehouseId={location_id}
                    onRowUpdate={updateItemPrice}
                    onCreateOrder={createErpSaleOrder}
                    entity={currentEntity}
                    selectWarehouse={selectWarehouse}
                    showLogisticsRouter={showLogisticsRouter}
                    propLoading={loading}
                    visible={editorStatus} onClose={() => hideEditor()} /> : null}
            <Card title="订单列表">
                <OrderFilter handleSearch={load} loading={loading} handleExport={handleExport} />
            </Card>

            <Card>
                <Table
                    pagination={{ page_size: page_size, current: page, total: total, onChange: onPageChange }}
                    loading={loading} size='middle' rowKey="id"
                    dataSource={dataList} scroll={{ x: 1500 }} >
                    <Table.Column width={180} dataIndex="order_code" title='订单号'
                        fixed='left' render={(val, record) => <a onClick={() => showEditor(record.id)}>{val}</a>}></Table.Column>
                    <Table.Column width={190} dataIndex="order_date" title='下单日期'></Table.Column>
                    <Table.Column width={190} dataIndex={['customer','name']} title='客户'></Table.Column>
                    <Table.Column width={220} dataIndex="receipt_info" title='收货地址' render={(receipt_info) => {
                        return <div>
                            <div>{receipt_info.linkMan}  {receipt_info.mobile} </div>
                            <div>{receipt_info.address} </div>
                        </div>
                    }} ></Table.Column>
                    <Table.Column width={120} dataIndex='order_status' title='进度' render={(order_status) =>
                        <Badge status='success' text={order_status} />} />
                    <Table.Column width={110} dataIndex="order_money" title='下单金额' render={(val) => <span style={{ color: "blue" }}>{val.toFixed(2)}</span>}></Table.Column>
                    <Table.Column width={110} dataIndex="order_qty" align='center' title='数量'></Table.Column>
                    <Table.Column width={100} dataIndex="payment_mode" title='汇款方式'></Table.Column>
                    <Table.Column width={220} dataIndex="remark" title='客户留言'></Table.Column>
                    <Table.Column width={110} dataIndex="create_user" title='提交人'></Table.Column>
                    <Table.Column width={110} dataIndex="create_date" title='提交日期'></Table.Column>
                    <Table.Column width={110} dataIndex="auditor" title='审核人'></Table.Column>
                    <Table.Column width={110} dataIndex="audit_date" title='审核时间'></Table.Column>
                </Table>
            </Card>
        </div>
        )
    }
}

class LogisticsRouterModal extends React.PureComponent {

    render() {
        const { visible, data, onCancel } = this.props;
        return (
            <Modal visible={visible} title="物流信息" width={500} footer={null} onCancel={() => onCancel(false)} bodyStyle={{ overflow: "auto", maxHeight: 500 }}>
                {data && data.length > 0 ? <Timeline>
                    {data.map(item => <Timeline.Item><p>{item.status}</p><p>{item.time}</p></Timeline.Item>)}
                </Timeline> : <span>暂无物流路由信息</span>}
            </Modal>
        )
    }
}

class CancelOrderModal extends React.PureComponent {
    state = {
        reason: "",
    }
    render() {
        const { visible, onCancel, handleCancelOrder, loading } = this.props;
        return (
            <Modal
                title="取消订单"
                visible={visible}
                width={'40%'}
                onOk={() => handleCancelOrder(this.state.reason)}
                confirmLoading={loading}
                onCancel={() => onCancel(null)}
                centered={true}
            >
                <Input.TextArea placeholder="请输入取消理由..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    defaultValue={this.state.reason}
                    onChange={e => this.setState({ reason: e.target.value })} />
            </Modal>
        )
    }
}

// 订单审核查询大栏
const OrderFilter = ({ handleSearch, loading, handleExport }) => {
    const [ form ] = Form.useForm();
    let condition;
    const getCondition = async () => {
        const values = await form.validateFields();
        if (values.order_code) {
            values.order_code = values.order_code.trim()
        }
        if (typeof values.order_status === 'string') {
            values.order_status = [values.order_status]
        }
        if (values.order_status && values.order_status.length > 0) {
            let order_status = ''
            for (let idx in values.order_status) {
                if (idx == 0) {
                    order_status += values.order_status[idx]
                } else {
                    order_status += ',' + values.order_status[idx]
                }
            }
            values.order_status = order_status

        }
        if (values.customer_id) {
            values.customer_id = values.customer_id.id;
        }
        if (values.date_range && values.date_range.length === 2) {
            values.start_time = values.date_range[0].unix();
            values.end_time = values.date_range[1].unix();
        }

        delete values.date_range;
        values.page = 1;
        values.load_customer = true;
        condition = values;
        // console.log('ok')
    }

    const exportOrderInfo = async () => {
        // e ? e.preventDefault() : null;
        // let condition = getCondition();
        await getCondition();
        handleExport(condition);
    };

    const onSubmit = async () => {
        // e ? e.preventDefault() : null;
        await getCondition();
        handleSearch(condition);
    };

    // const { getFieldDecorator } = form;
    const rangeConfig = {
        initialValue: [
            moment().subtract(7, 'days'),
            moment()],
        rules: [{ type: 'array', required: false, message: '请选择查询范围' }],
    };
    return <div>
        <Form form={form} layout='inline' onFinish={onSubmit} initialValues={{
            sort_type: 'ASC'
        }}>
            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item label='订&nbsp;&nbsp;单&nbsp;&nbsp;号' name="order_code">
                        <Input autoComplete='off' style={{ width: 250 }} />
                        {/* {getFieldDecorator("order_code")(<Input autoComplete='off' style={{ width: 210 }} />)} */}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label='客&nbsp;&nbsp;&nbsp;&nbsp;户' name="customer_id">
                        <LookupCustomer width={260} />
                        {/* {getFieldDecorator("customer_id")(<LookupCustomer width={260} />)} */}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label='状&nbsp;&nbsp;&nbsp;&nbsp;态' name="order_status">
                        <Select mode='multiple' style={{ minWidth: 120, width: 210 }}>
                            <Select.Option value='order_wait_for_pay'>待支付</Select.Option>
                            <Select.Option value='order_wait_for_audit'>商家审核</Select.Option>
                            <Select.Option value='order_wait_for_out'>待发货</Select.Option>
                            <Select.Option value='order_wait_for_ship'>待发运</Select.Option>
                            <Select.Option value='order_cancel'>取消</Select.Option>
                            <Select.Option value='order_finished'>完成</Select.Option>
                        </Select>
                        {/* {getFieldDecorator("order_status")
                            (<Select mode='multiple' style={{ minWidth: 120, width: 210 }}>
                                <Select.Option value='order_wait_for_pay'>待支付</Select.Option>
                                <Select.Option value='order_wait_for_audit'>商家审核</Select.Option>
                                <Select.Option value='order_wait_for_out'>待发货</Select.Option>
                                <Select.Option value='order_wait_for_ship'>待发运</Select.Option>
                                <Select.Option value='order_cancel'>取消</Select.Option>
                                <Select.Option value='order_finished'>完成</Select.Option>
                            </Select>)} */}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="下单日期" name="date_range" {...rangeConfig} style={{marginTop : 10}}>
                        <RangePicker style={{ width: 250 }} />
                        {/* {getFieldDecorator("date_range", rangeConfig)(<RangePicker style={{ width: 210 }} />)} */}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="排&nbsp;&nbsp;&nbsp;&nbsp;序" name="sort_type" style={{marginTop : 10}}>
                        <Select style={{ minWidth: 120, width: 260 }}>
                            <Select.Option key={1} value='ASC'>升序</Select.Option>
                            <Select.Option key={2} value='DESC'>降序</Select.Option>
                        </Select>
                        {/* {getFieldDecorator("sort_type", {initialValue: 'ASC'})
                            (<Select style={{ minWidth: 120, width: 260 }}>
                                <Select.Option key={1} value='ASC'>升序</Select.Option>
                                <Select.Option key={2} value='DESC'>降序</Select.Option>
                            </Select>)} */}
                    </Form.Item>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                    <Form.Item style={{marginTop : 10}}>
                        <Button htmlType='submit' style={{ marginRight: '1rem' }} type='primary' loading={loading} icon={<SearchOutlined />}>查询</Button>
                        <Button onClick={exportOrderInfo} loading={loading}>导出</Button>
                    </Form.Item>
                </Col>
            </Row>

        </Form>
    </div>
}

// 订单号详情
const OrderDetail = ({ selectWarehouseId, propLoading, entity, visible, onClose, onRowUpdate, onCreateOrder, selectWarehouse, showResonVisible, showLogisticsRouter }) => {
    const [cacheRecord, setCacheRecord] = useState(null);
    const [editRecord, setEditRecord] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (record, field, value) => {
        if (!record) {
            return;
        }
        record[field] = value;
    }
    const cancelUpdate = () => {
        setLoading(true);
        if (editRecord && cacheRecord) {
            Object.keys(cacheRecord).map(key => editRecord[key] = cacheRecord[key])
        }
        setCacheRecord(null);
        setEditRecord(null);
        setLoading(false);
    }

    const saveEntity = (updateEntity) => {
        if (!updateEntity) {
            return;
        }
        updateEntity.editStatus = false;
        setLoading(true);
        onRowUpdate ? onRowUpdate(updateEntity).then(success => {
            if (success) {
                setEditRecord(null)
            }
            setLoading(false)
        }) : null;
    }
    const showEditor = (record, status) => {
        cancelUpdate();
        setCacheRecord({ ...record })
        record.editStatus = status;
        setEditRecord(record)
    }

    let order_money = 0.00;
    entity && entity.items.forEach(item => order_money += item.qty * item.price);
    let act_money = entity && (order_money - entity.discount + entity.other_discount);
    const stepList = entity && entity.steps.map(order_step => {
        return <Step key={order_step.id}
            status={order_step.status}
            title={order_step.step}></Step>
    });
    return (
        <Drawer width={'65%'} visible={visible} onClose={onClose}>
            <div style={{
                marginBottom: 5,
                top: 0,
                width: '100%',
                borderBottom: "1px solid #e8e8e8",
                padding: "10px 16px",
                left: 0,
                background: "#fff",
                borderRadius: '0 0 4px 4px'
            }}>
                <div style={{ marginLeft: 8 }}>
                    发货仓：<LookupWarehouse value={selectWarehouseId} onChange={selectWarehouse} />

                    {entity.order_status === '已完成' ? <Button loading={propLoading} style={{ marginLeft: 26 }} onClick={() => showLogisticsRouter(entity.id)}>查看物流</Button> :
                        <i><Button style={{ marginLeft: 26 }} loading={propLoading} disabled={entity.is_create}
                            onClick={() => onCreateOrder(entity)} type="primary">
                            创建订单
                </Button>
                            <Button style={{ marginLeft: 26 }} type='danger' loading={propLoading} disabled={entity.is_create}
                                onClick={() => showResonVisible(entity)}>
                                取消订单
                </Button></i>}
                </div>
            </div>
            <div className={styles.description}>
                <Descriptions bordered layout='horizontal' size={'middle'} column={4}>
                    <Descriptions.Item label="订单号" span={2}> {entity.order_code} </Descriptions.Item>
                    <Descriptions.Item label="下单客户" span={2}>
                        {entity.customer.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="提货方式">
                        {entity.pickup_mode}
                    </Descriptions.Item>
                    <Descriptions.Item label="联系人">
                        {entity.receipt_info.linkMan}
                    </Descriptions.Item>
                    <Descriptions.Item label="联系电话" span={2}>
                        {entity.receipt_info.mobile}
                    </Descriptions.Item>
                    <Descriptions.Item label="下单日期">{entity.order_date}</Descriptions.Item>
                    <Descriptions.Item label="当前进度">
                        <Badge text={entity.order_status} status='success' />
                    </Descriptions.Item>
                    <Descriptions.Item label="支付状态"><span style={{ color: "red" }}>{entity.pay_status}</span></Descriptions.Item>
                    <Descriptions.Item label="业务员"><span>{entity.customer.employee}</span></Descriptions.Item>

                    <Descriptions.Item label="订单金额"><span style={{ color: "red" }}>{order_money.toFixed(2)}</span></Descriptions.Item>
                    <Descriptions.Item label="优惠金额"><span style={{ color: "red" }}>{entity.discount.toFixed(2)}</span></Descriptions.Item>
                    <Descriptions.Item label="运费金额"><span style={{ color: "red" }}>{(entity.other_discount).toFixed(2)}</span></Descriptions.Item>
                    <Descriptions.Item label="实付金额"><span style={{ color: "red" }}>{(act_money).toFixed(2)}</span></Descriptions.Item>
                    <Descriptions.Item label="收货地址" span={4}>
                        {entity.receipt_info.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="客户留言" span={4}>
                        {entity.remark}
                    </Descriptions.Item>
                    <Descriptions.Item label='订单进度' span={4}>
                        <Steps size='small' style={{ overflow: 'auto', paddingTop: 5 }} progressDot current={entity.order_progress}>
                            {stepList}
                        </Steps>
                    </Descriptions.Item>

                </Descriptions>
                <Table
                    scroll={{ x: 1000, y: 600 }}
                    loading={loading}
                    pagination={false}
                    dataSource={(entity && entity.items) ? entity.items : []}
                    rowKey="id"
                    style={{ marginTop: 10 }}>
                    <Table.Column width={220} title='商品' fixed='left' dataIndex='product'></Table.Column>
                    <Table.Column width={160} title='erp 商品' dataIndex='erp_product.name'></Table.Column>
                    <Table.Column width={100} title='erp 颜色' dataIndex='erp_color.name'></Table.Column>
                    <Table.Column title='数量' align="center" width={64} dataIndex='qty'></Table.Column>
                    <Table.Column title='出库数' align="center" width={100} dataIndex='out_qty'></Table.Column>

                    <Table.Column title='单价' width={64} dataIndex='price' align="center"
                        render={(val, record) => record.editStatus ?
                            <InputNumber defaultValue={val}
                                onChange={(val) => handleChange(record, 'price', val)} /> : val}></Table.Column>
                    <Table.Column title='优惠' align="center" width={100} dataIndex='discount' render={val => val.toFixed(2)}></Table.Column>
                    <Table.Column title='金额' align="center" width={100} dataIndex='amount' render={val => val.toFixed(2)}></Table.Column>
                    <Table.Column title='礼品' align="center" width={100} dataIndex='is_gift' render={val => <span>{val ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : null}</span>}></Table.Column>
                    {!entity.is_create && <Table.Column width={120} render={(_, record) =>
                        record.editStatus ?
                            <div> <a onClick={() => saveEntity(record)}>更新</a></div> :
                            <a onClick={() => showEditor(record, true)} >修改</a>}></Table.Column>}
                </Table>
            </div>
        </Drawer>
    );
}

// const OrderSearchForm = Form.create({ name: 'order_search' })(OrderFilter);