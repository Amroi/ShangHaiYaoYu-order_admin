import React from "react";
import { observable, action } from 'mobx';
import ajax from '../util/api/ajax';
import { message, Tag } from 'antd';

export default class OnlinePaymentStore {
    @observable loading = false
    @observable page = 1
    @observable pageSize = 10
    @observable total = 0
    @observable columns = []
    @observable data = []
    @observable voncherVisible = false
    @observable voncherUrl = ''
    @observable auditVisible = false
    @observable oneRow = null
    @observable status = 0
    @observable shop_id = 0;

    filter = {}
    auditColumn = {
        title: '操作',
        width: 80,
        render: record => (
            <a onClick={() => this.showAuditModal(record)}> 处理 </a>
        ),
    }
    erpPostColumn = {
        title: '过账状态',
        dataIndex: 'post_erp_status',
    }
    auditInfoColumn = [
        {
            title: "审核人",
            align: "center",
            width: 120,
            dataIndex: "check_user",
        },
        {
            title: "审核时间",
            align: "center",
            width: 120,
            dataIndex: "audit_time",
        }
    ]

    defaultColumns = [
        {
            title: '汇款人',
            width: 200,
            dataIndex: 'payer',
        },
        {
            title: '往来单位',
            dataIndex: 'customer_name',
            width: 150,
        },
        {
            title: '汇款日期',
            dataIndex: 'pay_date',
            width: 120,
        },
        {
            title: '汇款凭证',
            width: 120,
            dataIndex: 'upload_url',
            render: val => {
                return val ? (
                    <a onClick={() => this.showVoucher(val)}>
                        查看凭证
                </a>
                ) : ('无');
            },
        },
        {
            title: '汇款金额',
            width: 120,
            dataIndex: 'pay_money',
            render: val => <span style={{ color: 'red' }}>{val ? val.toFixed(2) : 0}</span>
        },

        {
            title: '汇款类型',
            width: 120,
            dataIndex: 'pay_type',
            render: val => <span><Tag color={val === '现款' ? 'blue' : 'green'}>{val}</Tag></span>
        },
        {
            title: '客户留言',
            dataIndex: 'remark',
            render: val => {
                return val ? <span style={{ color: '#1890ff' }}>{val}</span> : '无';
            },
        },
        {
            title: '汇入账户',
            width: 180,
            // dataIndex: ['bank_card','bank_type'],
            dataIndex: 'bank_type',    
            render: (val, record) => {
                return (
                    <div>
                        <span>
                            {val} {record.bank_card.owner}
                        </span>

                    </div>
                );
            },
        }
    ]

    @action
    fetch = async (params) => {
        this.loading = true;
        params.page = params.page ? params.page : this.page
        params.pageSize = params.pageSize ? params.pageSize : this.pageSize
        params.status = params.status ? params.status : this.status
        this.handleSearchStatusChange(params.status)
        try {
            const resp = await ajax({ url: '/erp/o2o/payment/list', method: 'post', data: params });
            if (resp.success) {
                this.data = resp.data;
                this.total = resp.total;
                this.page = params.page;
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    handleSearchStatusChange = (status) => {
        this.columns = this.defaultColumns
        if (status === 0) {
            this.columns.push(this.auditColumn);
        } else {
            this.columns.push(...this.auditInfoColumn);
        }
    }

    @action
    selectShop = (id) => {
        this.shop_id = id;
        sessionStorage.setItem('default_select_shop_id', id);
    }

    @action
    handleSearch = (params) => {
        this.filter.page = 1;
        this.page = 1;
        this.filter = {
            ...this.filter,
            ...params
        }
        this.fetch(this.filter)
    }

    @action
    handlePageChange = (page) => {
        this.filter.page = page;
        this.page = page;
        this.fetch(this.filter)
    }

    @action
    showAuditModal = async (record) => {
        if (this.auditVisible) {
            this.oneRow = null;
            this.auditVisible = !this.auditVisible;
            return
        }
        // 查询汇款信息详情
        this.loading = true;
        try {
            const resp = await ajax({ url: '/erp/o2o/payment/detail/' + record.id, method: 'get' });
            if (resp.success) {
                if (resp.code === 0) {
                    this.auditVisible = !this.auditVisible;
                    this.oneRow = resp.data;
                } else if (resp.code === 1) {
                    message.warn(resp.msg);
                }
            } else {
                message.error(resp.msg);
            }
        } finally {
            this.loading = false;
        }

    }

    @action
    handleAudit = async ({ id, action_type, remark, pay_bank_id, money }) => {
        this.loading = true;
        try {
            if (!this.shop_id) {
                message.warn('核算店铺不能为空');
                return
            }
            const resp = await ajax({
                url: '/erp/o2o/payment/audit', method: "POST", 
                data: { action_type: action_type, audit_remark: remark, id: id, pay_bank_id: pay_bank_id, money: money, shop_id: this.shop_id }
            });
            if (resp.success) {
                message.success(resp.msg)
                this.showAuditModal(null)
                this.fetch(this.filter)
            } else {
                message.error(resp.msg)
            }
        } finally {
            this.loading = false;
        }
    }

    showVoucher = (params) => {
        this.voncherUrl = params
        this.voncherVisible = !this.voncherVisible
    }

}