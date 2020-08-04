import React, { useState, useEffect, useImperativeHandle } from 'react';
import {  SearchOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Button,
    Table,
    Modal,
    InputNumber,
    Select,
    Input,
    Divider,
    Tag,
    message,
    Row,
    Col,
    DatePicker,
    Form
} from 'antd';
import ajax from '../../util/api/ajax';
import { SelectProduct } from '../../component/PopupProduct';
import { getId, getBatchId } from '../../util/api';
import moment from 'moment';
import LookupProdColorList from '../../component/O2O/LookupProdColorList';
import LookupCustomer from '../../component/O2O/LookupCustomer';

let filter = {};

const api = {
    getProductSkuList: async (erp_product_id) => {
        let resp = await ajax({ url: `/erp/o2o/product/list?is_public=1&erp_product_id=${erp_product_id}`, method: "GET" });
        return resp.success ? resp.data : [];
    },
    getCustomerTypeList: async () => {
        let resp = await ajax({ url: "/erp/customer/type/list", method: "POST" });
        return resp.success ? resp.data : [];
    },
    get: async (id) => {
        let resp = await ajax({ url: `/erp/o2o/product/limit/detail/${id}` });
        return resp;
    },

    // 查询规则
    getList: async (param) => {
        filter = { ...filter, ...param }
        let formData = new FormData();
        Object.keys(filter).map(key => formData.append(key, filter[key]));
        let resp = ajax({ url: "/erp/o2o/product/limit/list", method: "POST", data: formData })

        return resp;
    },
    // 删除规则
    delete: async (id) => {
        let resp = ajax({ url: `/erp/o2o/product/limit/remove/${id}`, method: "POST" })
        return resp;
    },
    // 更新规则
    update: async (id, entity) => {
        let resp = ajax({ url: `/erp/o2o/product/limit/update/${id}`, method: "POST", data: entity })
        return resp;
    },
    // 创建规则
    create: async (entity) => {
        let resp = ajax({ url: "/erp/o2o/product/limit/create", method: "POST", data: entity })
        return resp;
    },
}

// 订购规则查询大栏
const RuleSearchFilter = ({ handleSubmit, loading }) => {
    const [form] = Form.useForm();
    const handleSearch = values => {
        // e ? e.preventDefault() : null;
        handleSubmit(values);
       
    };
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

    // const { getFieldDecorator } = form;
    return (
        <Form form={form} {...formItemLayout} onFinish={handleSearch}>
            <Row gutter={8}>
                <Col span={6} style={{ textAlign: 'left' }}>
                    <Form.Item label='规则名称'  name="rule_name" initialValue={filter.rule_name || ''}>
                    <Input autoComplete='off' placeholder="规则名称" />
                        {/* {getFieldDecorator("rule_name", {
                            initialValue: filter.rule_name || ''
                        })(<Input autoComplete='off' placeholder="规则名称" />)} */}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
                        查询
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

const ProductLimitRulePage = () => {
    const loadLimitRuleList = async (param) => {
        setLoading(true);
        const resp = await api.getList(param)
        if (resp) {
            if (resp.success) {
                setTotal(resp.total)
                setRuleList(resp.data)
            }
        }
        setLoading(false)
    }
    const columns = [
        {
            title: '名称',
            dataIndex: "rule_name",
        },
        {
            title: '限购机型',
            dataIndex: "erp_product",
        },
        {
            title: '规则类型',
            align: 'center',
            dataIndex: "rule_type",
            width: 110,
            render: (val) =>
                <Tag color="orange">{val == "sku" ? '单品' : val == "customer" ? '客户' : val == "specific" ? '指定客户' : "未知"}</Tag>
        },
        {
            title: '创建人',
            align: 'center',
            dataIndex: "creator",
            width: 84,
        },
        {
            title: '创建时间',
            align: 'center',
            dataIndex: "create_at",
            width: 120,
        },
        {
            title: '更新人',
            align: 'center',
            dataIndex: "updater",
            width: 84,
        },
        {
            title: '更新时间',
            align: 'center',
            dataIndex: "update_at",
            width: 120,
        },
        {
            title: '操作',
            align: 'center',
            render: (_, record) =>
                <span>
                    <a onClick={(e) => showOrderRule(record)}>编辑</a>
                    <Divider type="vertical" />
                    <a onClick={(e) => showDelete(record)}>删除</a>
                </span>,
            width: 120
        },
    ]
    const [ruleList, setRuleList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editEntity, setEntity] = useState({});
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [editorStatus, setEditStatus] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);

    useEffect(() => {
        api.getList().then(resp => {
            if (resp.success) {
                setRuleList(resp.data)
                setTotal(resp.total)
            } else {
                setRuleList([])
            }
        });
    }, [])

    const add = () => {
        setEntity({ version: 0, id: 0, });
        setEditStatus(true)
    }
    const showOrderRule = (record) => {
        setEntity(record)
        setEditStatus(true)
    }

    const showDelete = (record) => {
        setEntity(record)
        setDeleteVisible(true)
    }

    const onPageChange = (page) => {
        setPage(page)
        let param = {
            page: page
        }
        loadLimitRuleList(param)
    }

    const handleDeleteRule = async (id) => {
        const resp = await api.delete(id)
        if (resp) {
            if (resp.success) {
                message.success(resp.msg)
                setEntity({})
                setDeleteVisible(false)
                api.getList().then(resp => resp.success ? setRuleList(resp.data) : setRuleList([]));
            } else {
                message.warn(resp.msg)
            }
        }
    }

    return (
        <div>
            <Card title='订购规则'>
                <RuleSearchFilter handleSubmit={loadLimitRuleList} loading={loading} />
            </Card>
            <Card style={{ marginTop: 10 }}>
                <Button loading={loading} type='primary' style={{ marginBottom: 5 }} onClick={() => add()}>新建</Button>
                <Table
                    bordered={true}
                    loading={loading}
                    rowKey="id"
                    dataSource={ruleList}
                    columns={columns}
                    pagination={{ current: filter.page || page, pageSize: pageSize, total: total, onChange: onPageChange }}>
                </Table>
            </Card>
            {editorStatus ?
                <ProductOrderRuleEditor
                    onCancel={() => setEditStatus(false)}
                    loadLimitRuleList={loadLimitRuleList}
                    visible={editorStatus}
                    loading={loading}
                    data={editEntity}
                /> : null}
            {deleteVisible ?
                <RuleDelModal
                    data={editEntity}
                    visible={deleteVisible}
                    onCancel={() => { setEntity({}), setDeleteVisible(false) }}
                    handleDelete={handleDeleteRule}
                    loading={loading} /> : null}
        </div>
    )
}

class RuleDelModal extends React.PureComponent {
    render() {
        const { data, onCancel, visible, handleDelete, loading } = this.props
        return (
            <Modal
                title="删除"
                okText="删除"
                visible={visible}
                confirmLoading={loading}
                onOk={() => handleDelete(data.id)}
                onCancel={onCancel}
            >
                确认删除订购规则 [{data.rule_name}] 吗？
            </Modal>
        )
    }
}

// 新建订购规则
const ProductOrderRuleEditor = ({ visible, onCancel, data, loadLimitRuleList }) => {
    let newData = { ...data }
    const [rule, setRule] = useState(newData);
    const [ruleList, setRuleList] = useState(rule.rule_list || null);
    const [selectRuleType, setSelectRuleType] = useState(rule ? rule.rule_type : null);
    const [loading, setLoading] = useState(false);
    const [bindProduct, setBindProduct] = useState({ id: data.erp_product_id, name: data.erp_product_name });
    const ruleDetailRef = React.useRef();

    const handleSubmit = async () => {
        if (selectRuleType === 'customer' || selectRuleType === 'specific') {
            if (!rule.color_list || rule.color_list.length === 0) {
                message.warn("请选择商品颜色");
                return;
            }
        }
        if (!rule.rule_name || rule.rule_name === '') {
            message.warn("规则名称不能为空")
            return
        }
        if (!rule.erp_product_id || rule.erp_product_id === '0') {
            message.warn('限购机型错误')
            return
        }
        if (!rule.limit_time || rule.limit_time.length !== 2) {
            message.warn("请选择限购时间");
            return
        }
        let colors = "";
        for (let i in rule.color_list) {
            if (i == 0) {
                colors = rule.color_list[i];
            } else {
                colors += "," + rule.color_list[i];
            }
        }
        rule.colors = colors;
        rule.limit_start_at = rule.limit_time[0].unix();
        rule.limit_end_at = rule.limit_time[1].unix();
        
        let postData = { ...rule };
        delete postData.color_list;
        delete postData.limit_time;
        postData.rule_type = selectRuleType;
        // 按产品走不会有 rule_list
        if (ruleDetailRef.current) {
            postData.rule_list = ruleDetailRef.current.getRuleList();
            if (!postData.rule_list || postData.rule_list.length === 0) {
                message.warn("规则列表不能为空");
                return;
            }
            if (selectRuleType === 'specific') {
                let arr = new Array();
                for (let idx in postData.rule_list) {
                    if (arr.indexOf(postData.rule_list[idx].bind_id) > -1) {
                        message.destroy();
                        message.warn('存在相同的指定客户，请调整');
                        return;
                    }
                    arr.push(postData.rule_list[idx].bind_id);
                }
            }
        }
        try {
            setLoading(true);
            let resp;
            if (!rule.id) {
                postData.id = rule.erp_product_id;
                resp = await api.create(postData);
            } else {
                resp = await api.update(postData.id, postData);
            }
            if (resp) {
                if (resp.success) {
                    message.success(resp.msg);
                    onCancel();
                    loadLimitRuleList();
                } else {
                    message.warn(resp.msg);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    const handleTypeChange = async (ruleData, val) => {
        let data = [];
        if (val === 'customer') {
            data = await api.getCustomerTypeList();
        } else if (val === 'sku') {
            data = await api.getProductSkuList(ruleData.erp_product_id);
        }
        let idList = await getBatchId(data.length + 10);
        let newDataList = [];
        newDataList = data.map((e, idx) => {
            for (let item in ruleList) {
                if (item.bind_id === e.id) {
                    return item;
                }
            }
            return { bind_id: e.id.toString(), bind_name: val === 'sku' ? e.display_name : e.name, id: idList[idx], limit_qty: 0, limit_price: 0 };
        });
        setRuleList(newDataList);
        setSelectRuleType(val);
    }
    rule.limit_time = rule.limit_start_at ? [moment.unix(rule.limit_start_at), moment.unix(rule.limit_end_at)] : [moment().subtract(7, 'days'), moment()];
    return (
        <Modal
            title="订购规则"
            style={{ minWidth: '60%' }}
            visible={visible}
            onCancel={() => onCancel()}
            okText="确认"
            onOk={handleSubmit}
            centered={true}
            confirmLoading={loading}
            destroyOnClose={true}>
            <Form layout='horizontal' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item required label='规则名称'>
                    <Input defaultValue={rule.rule_name} onChange={(e) => rule.rule_name = e.target.value} placeholder={'请输入规则名称'} />
                </Form.Item>

                <Form.Item required label='限购类型' >
                    <Select onChange={(val) => handleTypeChange(rule, val)} defaultValue={rule.rule_type}>
                        <Select.Option key='sku' value={'sku'}>单品限购</Select.Option>
                        <Select.Option key='customer' value={'customer'}>客户限购</Select.Option>
                        <Select.Option key='customer' value={'specific'}>指定客户</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item required label='限购机型'>
                    <SelectProduct product={{ id: rule.erp_product_id, name: rule.erp_product }}
                        onSelect={(product) => {
                            rule.erp_product_id = product.id;
                            rule.erp_product = product.name;
                            delete rule.colors;
                            setBindProduct({ id: product.id, name: product.name });
                        }} />
                </Form.Item>

                <Form.Item required label="限购时间">
                    <DatePicker.RangePicker defaultValue={rule.limit_time} onChange={(e) => { rule.limit_time = e }} />
                </Form.Item>

                {(selectRuleType === 'customer' || selectRuleType === 'specific') && <Form.Item required label="颜色">
                    <LookupProdColorList product_id={rule.erp_product_id} defaultValue={rule.colors && rule.colors.split(",")} onChange={(val) => { rule.color_list = val }}></LookupProdColorList>
                </Form.Item>}
                {selectRuleType === 'sku' || selectRuleType === 'customer' ?
                    <ProductLimitRuleDetail ruleList={ruleList} product={bindProduct} rule={rule} rule_type={selectRuleType} ref={ruleDetailRef} /> : null}
                { selectRuleType === 'specific' ? <ProdLimitDetailWithSpecific ruleList={ruleList} ref={ruleDetailRef} />  : null }
                {/* {selectRuleType === 'product' ?
                    <Form.Item required label="限购台数">
                        <InputNumber min={0} defaultValue={rule.limit_qty} onChange={val => rule.limit_qty = val}></InputNumber>
                    </Form.Item> :
                    (selectRuleType === 'sku' || selectRuleType === 'customer') ?
                        <ProductLimitRuleDetail ruleList={ruleList} product={bindProduct} rule={rule} rule_type={selectRuleType} ref={ruleDetailRef} /> : null
                } */}
            </Form>
        </Modal>
    )
}

// 订购规则里的下栏
const ProdLimitDetailWithSpecific = React.forwardRef((props, ref) => {
    const [dataList, setDataList] = useState(props.ruleList ? props.ruleList : []);

    const columns = [
        {
            title: '绑定客户',
            dataIndex: 'bind_id',
            width: '60%',
            render: (val, record) => { return <LookupCustomer defaultId={record.bind_id} width={400} onChange={(customerInfo) => selectCustomer(customerInfo, record)} />}
        },
        {
            title: '限购数量',
            dataIndex: 'limit_qty',
            align: 'center',
            render: (_, record) => <InputNumber defaultValue={record.limit_qty} min={0} onChange={(val) => record.limit_qty = val} />
        },
        {
            title: '限购价格',
            dataIndex: 'limit_price',
            align: 'center',
            render: (_, record) => <InputNumber defaultValue={record.limit_price} min={1} onChange={(val) => record.limit_price = val} />
        },
        {
            title: '操作',
            render: (_, reocrd, idx) => (<a onClick={() => remove(idx)}>X</a>)
        }
    ];
    
    useImperativeHandle(ref, () => ({
        getRuleList() {
            return dataList;
        },
    }));

    const selectCustomer = (customerInfo, record) => {
        record.bind_id = customerInfo ? customerInfo.id : 0;
        record.bind_name = customerInfo ? customerInfo.name : '';
    }

    const remove = (idx) => {
        let list = [...dataList];
        list.splice(idx, 1);
        setDataList(list);
    }

    const addRow = () => {
        let rowInfo = {
        id: new Date().getTime().toString(),
        bind_id: 0,
        bind_name: '',
        limit_qty: 0,
        limit_price: 1,
        };
        let newList = [ ...dataList ];
        newList = newList.concat(rowInfo);
        setDataList(newList);
    }

    return <div>
        <Table rowKey='id' columns={columns} dataSource={dataList} />
        <Button style={{ flex: 1, justifySelf: 'center', width: "100%" }} onClick={() => addRow()}>增行</Button>
        </div>
});

const ProductLimitRuleDetail = React.forwardRef((props, ref) => {
    // 数据
    const [dataList, setDataList] = useState(props.ruleList);
    const [removeDataList, setRemoveDataList] = useState([]);

    useImperativeHandle(ref, () => ({
        getRuleList() {
            return dataList;
        },
    }));

    const loadTypeList = async () => {
        message.loading('正在加载数据...');
        try {
            let data;
            if (props.rule_type == 'customer') {
                data = await api.getCustomerTypeList();
            } else {
                data = await api.getProductSkuList(props.rule.erp_product_id);
            }

            let idList = await getBatchId(data.length + 10);
            let newDataList = [];
            newDataList = data.map((e, idx) => {
                for (let item in dataList) {
                    if (item.bind_id === e.id) {
                        return item;
                    }
                }
                return { bind_id: e.id.toString(), bind_name: props.rule_type == 'sku' ? e.display_name : e.name, id: idList[idx], limit_qty: 0, limit_price: 0 };
            });
            setDataList(newDataList)
        } finally {
            message.destroy();
        }
    }

    useEffect(() => {
        setDataList(props.ruleList)
    }, [props.ruleList]);

    const remove = (idx) => {
        const removeEntity = { ...dataList[idx] };
        dataList.splice(idx, 1);
        if (removeEntity.version > 0) {
            removeEntity.version = -1;
            let newRemoveList = removeDataList.concat(removeEntity);
            setRemoveDataList(newRemoveList);
        }
        setDataList([...dataList]);
    };

    return <div>
        <Table rowKey="id" dataSource={dataList}>
            <Table.Column width={220} dataIndex="bind_name" title='限购类型'></Table.Column>
            <Table.Column width={100} dataIndex="limit_qty" title='限购数'
                render={(val, record) => < InputNumber min={0} defaultValue={val} onChange={val => record.limit_qty = val} />} ></Table.Column>
            <Table.Column width={100} dataIndex="limit_price" title='限购价'
                render={(val, record) => < InputNumber min={0} defaultValue={val} onChange={val => record.limit_price = val} />}></Table.Column>
            <Table.Column width={80} dataIndex="id" title=''
                render={(val, record, idx) => <a onClick={() => remove(idx)}>X</a>}></Table.Column>
        </Table>
        <Button style={{
            width: '100%',
            textAlign: "center",
            flex: 1, justifyContent: 'center'
        }} type='ghost' onClick={() => loadTypeList()}>加载类型</Button>
    </div>
})

// const RuleListSearch = Form.create({ name: 'rule_search' })(RuleSearchFilter);
export default ProductLimitRulePage;