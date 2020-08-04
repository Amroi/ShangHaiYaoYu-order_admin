import { observable, action } from 'mobx';
import ajax from '../util/api/ajax';
import { stringify } from 'qs';
import { message } from 'antd';

export default class ProductLimitRuleStore {
    @observable dataList = [
        {
            rule_name: "小米9",
            product_type: "6+64",
            rule_type: "综合",
            qty: 8,
        },
        {
            rule_name: "华为NOVA",
            product_type: "6+64",
            rule_type: "单品",
            qty: 8,
        },
        {
            rule_name: "小米8",
            product_type: "6+64",
            rule_type: "客户",
            qty: 8,
        }
    ];
    @observable total = 0;
    @observable page = 1;
    @observable page_size = 10;
    @observable total = 0;
    @observable loading = false;
    @observable visible = false;
    @observable selectRuleType = 1;
    @observable productSkuData = [
        {
            display_name: "lime",
            sku: "122121"
        },
        {
            display_name: "green",
            sku: "334455"
        }
    ];
    selectRowData = null;
    filter = {};

    // 查询商品订购规则
    @action
    queryOrderRule = async(params) => {
        this.loading = true
        try {
            const resp = await ajax({url: '/erp/o2o/product/order/rule?' + stringify(params), method: 'get'})
            if (resp && resp.success) {
                if (resp.success) {
                    this.orderRuleData = resp.data
                } else {
                    message.error(resp.msg)
                }
            }
        } finally {
            this.loading = false
        }
    }

    // 删除订购规则
    @action
    handleDeleteLimitRule = async(params) => {
        this.loading = true
        try {
            const resp = await ajax({url: '/erp/o2o/product/order/rule?' + stringify(params), method: 'delete'})
            if (resp && resp.success) {
                if (resp.success) {
                    this.orderRuleData = resp.data
                } else {
                    message.error(resp.msg)
                }
            }
        } finally {
            this.loading = false
        }
    }

    // 保存订购规则（新增或更新）
    @action
    handleSaveLimitRule = async(params) => {
        this.loading = true
        try {
            const resp = await ajax({url: '/erp/o2o/product/order/rule', method: 'post', data: stringify(params)})
            if (resp && resp.success) {
                if (resp.success) {
                    message.success(resp.msg)
                } else {
                    message.error(resp.msg)
                }
            }
        } finally {
            this.loading = false
        }
    }

    @action
    handleRuleTypeChange = async(params) => {
        if (params === 'sku') {
            this.selectRuleType = 1
        } else if (params === 'product') {
            this.selectRuleType = 2
        } else if (params === 'customer') {
            this.selectRuleType = 3
        }
    }

    changeVisible = (data) => {
        this.visible = !this.visible
        this.selectRowData = data
    }
}