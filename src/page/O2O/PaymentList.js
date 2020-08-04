import React from "react";
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import LookupBankCard from '../../component/O2O/LookupBankCard';
import { SearchOutlined } from '@ant-design/icons';
// import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Table,
    Button,
    Input,
    Select,
    DatePicker,
    Modal,
    Spin,
    message,
    InputNumber,
    Row,
    Col,
    Form
} from "antd";
import moment from 'moment';
import LookUpShopList from "../../component/O2O/LookupShop";
import ViewPic from "../../component/O2O/ViewPic";

@withRouter
@inject("paymentStore")
@observer
export default class PaymentList extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.props.paymentStore.fetch(this.props.paymentStore.filter)
    }

    render() {
        const { page, pageSize, total, loading,
            data, columns, handleSearch, handlePageChange,
            voncherVisible, showVoucher, voncherUrl,
            handleAudit, auditVisible, oneRow, showAuditModal,
            shop_id, selectShop
        } = this.props.paymentStore

        return (
            <div>
                <Card title="收款核对">
                    <SearchCondition loading={loading} handleSearch={handleSearch} />
                </Card>

                <Card style={{ marginTop: 5 }}>
                    <Table
                        scroll={{ x: 1280 }}
                        rowKey={'id'}
                        loading={loading}
                        columns={columns}
                        dataSource={data}
                        pagination={{ current: page, showQuickJumper: false, pageSize: pageSize, total: total, onChange: handlePageChange, }}
                    />
                </Card>
                <VoucherModal
                    visible={voncherVisible}
                    voncherUrl={voncherUrl}
                    loading={loading}
                    showVoucher={showVoucher}
                />
                {auditVisible ?
                    <AuditModal
                        handleAudit={handleAudit}
                        visible={auditVisible}
                        oneRow={oneRow}
                        loading={loading}
                        showAuditModal={showAuditModal}
                        selectShopId={shop_id}
                        selectShop={selectShop} />
                    : null}

            </div>
        )
    }
}

// 收款审核的处理功能
class AuditModal extends React.PureComponent {
    state = {
        card_no: 0,
        remark: '',
        money: 0.0,
    }

    render() {
        const { visible, oneRow, showAuditModal, handleAudit, selectShopId, selectShop } = this.props;
        return (
            <Modal
                style={{ maxWidth: '60%' }}
                title="汇款审核"
                visible={visible}
                onCancel={() => showAuditModal(null)}
                centered={true}
                footer={null}
                destroyOnClose={true}
            >
                {oneRow ? (
                    <Form layout='horizontal' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                        <Form.Item label='汇款人'>
                            <Input readOnly defaultValue={oneRow.payer} />
                        </Form.Item>
                        <Form.Item label='所属客户'>
                            <Input readOnly defaultValue={oneRow.customer_name}
                            />
                        </Form.Item>
                        <Form.Item label="可用余额">
                            <Input readOnly style={{ color: 'red' }} defaultValue={oneRow.balance < 0 ? '贵司尚欠我司 ' + Math.abs(oneRow.balance).toFixed(2) : '我司尚欠贵司 ' + oneRow.balance.toFixed(2)}
                            />
                        </Form.Item>
                        <Form.Item label='汇款金额'>
                            <InputNumber
                                min={0}
                                style={{ color: '#000', backgroundColor: '#ffffff', width: '80%' }}
                                // disabled={true}
                                onChange={e => {
                                    this.setState({
                                        money: e,
                                    });
                                }}
                                defaultValue={oneRow.pay_money}
                            />
                        </Form.Item>
                        <Form.Item label='汇款日期'>
                            <Input
                                readOnly
                                defaultValue={oneRow.pay_date}
                            />
                        </Form.Item>
                        <Form.Item label='汇入账户'>
                            <LookupBankCard value={oneRow.pay_bank_id} onChange={e => {
                                oneRow.pay_bank_id = e.id
                                this.setState({
                                    card_no: e.card_no
                                })
                            }} />

                        </Form.Item>
                        <Form.Item label='汇入卡号'>
                            <Input
                                style={{ color: '#000', backgroundColor: '#ffffff' }}
                                disabled={true}
                                value={this.state.card_no || oneRow.bank_card.card_no}
                            />
                        </Form.Item>
                        <Form.Item label='核算店铺'>
                            <LookUpShopList value={selectShopId} onChange={selectShop} />
                        </Form.Item>
                        <Form.Item label='备注'>
                            <Input
                                maxLength={100}
                                style={{ color: '#000', backgroundColor: '#ffffff' }}
                                onChange={e => {
                                    this.setState({
                                        remark: e.target.value
                                    })
                                }}
                            />
                        </Form.Item>

                        <div style={{ textAlign: 'center', }}>

                            <Button
                                loading={this.props.loading}
                                type="primary"
                                style={{ marginTop: 16 }}
                                onClick={() => handleAudit({ id: oneRow.id, action_type: 'audit', remark: this.state.remark, pay_bank_id: oneRow.pay_bank_id, money: this.state.money })}
                            >通过
                           </Button>
                            <Button
                                type='danger'
                                loading={this.props.loading}
                                style={{ marginLeft: 24 }}
                                onClick={() => handleAudit({ id: oneRow.id, action_type: 'reject', remark: this.state.remark, pay_bank_id: oneRow.pay_bank_id, money: this.state.money })}
                            >不通过
                            </Button>
                        </div>
                    </Form>

                ) : (
                        <Spin />
                    )}
            </Modal>
        );
    }
}

// 查看凭证
class VoucherModal extends React.Component {
    render() {
        const { visible, voncherUrl, showVoucher } = this.props;
        return (
            <Modal
                // width="100%"
                destroyOnClose
                style={{ maxWidth: 500 }}
                visible={visible}
                onCancel={showVoucher}
                footer={null}
                centered={true}
            >
                <ViewPic picUrl={voncherUrl} />
            </Modal>
        );
    }
}

// 收款核对查询大栏
class SearchCondition extends React.Component {
    formRef = React.createRef();
    onFinish = values => {
        if (values.pay_money) {
            values.pay_money = values.pay_money.trim();
            if (isNaN(values.pay_money)) {
                message.warn('金额请输入数字');
                return
            }
        } else {
            values.pay_money = '0'
        }
        if (values.payer) {
            values.payer = values.payer.trim();
        }
        values.bank_card_id = values.bank_card ? values.bank_card.id : '0';
        values.pay_money = values.pay_money || '0';
        if (values.date_range && values.date_range.length === 2) {
            values.start_time = values.date_range[0].unix();
            values.end_time = values.date_range[1].unix();
        }
        delete values.date_range;
        this.props.handleSearch(values);
    };
    render() {
        // const { getFieldDecorator } = this.props.form;

        const rangeConfig = {
            initialValue: [
                moment().subtract(1, 'days'),
                moment()],
            rules: [{ type: 'array', required: false, message: '请选择查询范围' }],
        };
        return (
            <Form ref={this.formRef} onFinish={this.onFinish} layout="inline">
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item label='汇&nbsp;&nbsp;款&nbsp;&nbsp;人' name="payer">
                            <Input autoComplete='off' placeholder="汇款人" style={{ width: 260 }} />
                            {/* {getFieldDecorator('payer')(<Input autoComplete='off' placeholder="汇款人" style={{width: 210}} />)} */}
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label='账&nbsp;&nbsp;&nbsp;&nbsp;户' name="bank_card" >
                            <LookupBankCard style={{ width: 300 }}/>
                            {/* {getFieldDecorator('bank_card')(<LookupBankCard />)} */}
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label='金&nbsp;&nbsp;&nbsp;&nbsp;额' name="pay_money" >
                            <Input autoComplete='off' placeholder="金额" style={{ width: 335 }}/>
                            {/* {getFieldDecorator('pay_money')(<Input autoComplete='off' placeholder="金额" />)} */}
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="汇款日期" name='date_range' {...rangeConfig} style={{marginTop : 10}}>
                            <DatePicker.RangePicker style={{ width: 260 }} />
                            {/* {getFieldDecorator("date_range", rangeConfig)(<DatePicker.RangePicker style={{width: 210}} />)} */}
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label='状&nbsp;&nbsp;&nbsp;&nbsp;态' name="status" initialValue={0} style={{marginTop : 10}}>
                            <Select style={{ width: 336 }}>
                                <Select.Option value={0}>未处理</Select.Option>
                                <Select.Option value={2}>通过</Select.Option>
                                <Select.Option value={4}>未通过</Select.Option>
                            </Select>
                            {/* {getFieldDecorator('status', {
                                initialValue: 0
                            })(
                                <Select style={{ width: 200 }}>
                                    <Select.Option value={0}>未处理</Select.Option>
                                    <Select.Option value={2}>通过</Select.Option>
                                    <Select.Option value={4}>未通过</Select.Option>
                                </Select>
                            )} */}
                        </Form.Item>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Form.Item>
                            <Button
                                loading={this.props.loading}
                                style={{ float: 'right' ,marginTop : 10}}
                                htmlType="submit"
                                type="primary"
                                icon={<SearchOutlined />}
                            > 查询
                        </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    }
}