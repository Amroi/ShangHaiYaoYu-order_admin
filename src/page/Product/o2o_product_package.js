import React, { useState, useImperativeHandle } from 'react';
import {  SearchOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Table,
    Button,
    Modal,
    InputNumber,
    Input,
    message,
    Divider,
    Row,
    Col,
    Select,
    Form
} from 'antd';
import { SearchO2OProduct } from '../../component/O2O/LookupO2OProduct';
import ajax from '../../util/api/ajax';
import { getId } from '../../util/api';

// 套餐管理查询大栏
const PackageSearchFilter = ({ handleSubmit, loading }) => {
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
                    <Form.Item label='套餐名称' name="package_name" initialValue={filter.package_name||''}> 
                    <Input autoComplete='off' placeholder="套餐名称" />
                        {/* {getFieldDecorator("package_name", {
                            initialValue: filter.package_name || ''
                        })(<Input autoComplete='off' placeholder="套餐名称" />)} */}
                    </Form.Item>
                </Col>

                <Col span={6} >
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                        查询
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

let filter = {}

const ProductPackage = ({ }) => {
    const [loading, setLoading] = useState(false);
    const [editorVisible, setEditorVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [editEntity, setEditEntity] = useState(null);
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const handleSubmit = async (postData) => {
        if (!postData.package_name) {
            message.warn('套餐名称不能为空')
            return
        }
        if (postData.gift_limit !== "通用" && (!postData.product_id || !postData.product)) {
            message.warn('请选择绑定商品')
            return
        }
        if (!postData.package_buy_limit || postData.package_buy_limit <= 0) {
            message.warn('限购数量不能小于 0')
            return
        }
        if (postData.sku_list.length === 0) {
            message.warn('套餐商品不能为空')
            return
        }
        for (let idx in postData.sku_list) {
            if (postData.sku_list[idx].version === -1) {
                continue;
            }
            if (!postData.sku_list[idx].sku) {
                message.warn("存在未选择的套餐商品，请删除该行或选择商品");
                return;
            }
            if (postData.sku_list[idx].sku === postData.sku) {
                message.warn("套餐商品不能与主商品相同");
                return;
            }
        }
        let resp;
        try {
            setLoading(true);
            if (postData.id && postData.id !== "0") {
                resp = await ajax({ url: "/erp/o2o/product/package/update/" + postData.id, data: postData, method: "POST" });
            } else {
                resp = await ajax({ url: "/erp/o2o/product/package/create", method: "POST", data: postData });

            }
            if (resp.success) {
                message.success(resp.msg);
                setEditorVisible(false)
                setEditEntity({})
                loadPackageList();
            } else {
                message.error(resp.msg);
            }
        } finally {
            setLoading(false);
        }
    }
    const loadPackageList = (param) => {
        setLoading(true);
        filter = { ...filter, ...param }
        var formData = new FormData();
        Object.keys(filter).map(key => formData.append(key, filter[key]));
        ajax({ url: "/erp/o2o/product/package/list", method: "POST", data: formData }).then(resp => {
            setLoading(false);
            if (resp.success) {
                setPackageList(resp.data);
                setTotal(resp.total)
            }
        })
    }

    const showEditor = (entity) => {
        setLoading(true);
        ajax({ url: `/erp/o2o/product/package/detail/${entity.id}`, method: "POST" }).then(resp => {
            setLoading(false);
            if (resp.success) {
                setEditEntity(resp.data);
                setEditorVisible(true);
            }
        })
    }

    const showDelete = (entity) => {
        setDeleteVisible(true);
        setEditEntity(entity);
    }

    const handleDeletePackage = async (packageId) => {
        try {
            setLoading(true);
            const resp = await ajax({ url: `erp/o2o/product/package/remove/${packageId}`, method: "POST" });
            if (resp.success) {
                message.success('删除套餐成功');
                setDeleteVisible(false)
                setEditEntity({});
                loadPackageList();
                return;
            }
            message.error("删除套餐失败");
        } finally {
            setLoading(false);
        }
    }

    const onPageChange = (page) => {
        setPage(page)
        let filter = {
            page: page
        }
        loadPackageList(filter)
    }

    const [packageList, setPackageList] = useState(loadPackageList);

    const columns = [
        {
            title: '套餐',
            align: 'center',
            dataIndex: "package_name",
            width: 280,
        },
        {
            title: '限购数',
            align: 'center',
            dataIndex: "package_buy_limit",
            width: 120,
        },

        {
            title: '单价',
            width: 100,
            align: 'center',
            dataIndex: "package_price",

        },
        {
            title: '套餐明细',
            dataIndex: "remark",
            width: 300,
            render: (val) => <span>{val.split(',').map((item, key) => <p key={key}>{item}</p>)}</span>
        },
        {
            title: '创建人',
            align: 'center',
            dataIndex: "creator",
            width: 100,
        },
        {
            title: '操作',
            align: 'center',
            width: 100,
            render: (_, record) => <span><a onClick={() => showEditor(record)}>编辑</a><Divider type='vertical' /> <a onClick={() => { showDelete(record) }}>删除</a></span>
        },
    ]

    return (
        <div>
            <Card title='套餐管理'>
                <PackageSearchFilter handleSubmit={loadPackageList} loading={loading} />
            </Card>

            <Card style={{ marginTop: 10 }}>
                <Button type='primary' loading={loading} onClick={() => setEditorVisible(true)} style={{ marginBottom: 5 }}>新建</Button>

                <Table
                    bordered={true}
                    loading={loading}
                    rowKey="id"
                    dataSource={packageList}
                    columns={columns}
                    pagination={{ current: filter.page || page, pageSize: pageSize, total: total, onChange: onPageChange }}>
                    >
                </Table>
            </Card>
            {editorVisible ? <ProductPackageEditor
                onCancel={() => { setEditorVisible(false), setEditEntity(null) }}
                visible={editorVisible}
                loading={loading}
                handleSubmit={handleSubmit}
                data={editEntity}
                onClose={() => setEditorVisible(false)}
            /> : null}
            {deleteVisible ? <PackageDelModal loading={loading} setLoading={setLoading} visible={deleteVisible} data={editEntity} onCancel={() => { setEditEntity({}), setDeleteVisible(false) }} handleDelete={handleDeletePackage} /> : null}

        </div>
    )

}

const ProductPackageSkuList = React.forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        getSkuList() {
            return dataSource.concat(removeList);
        },
    }));
    const [dataSource, setDatasource] = useState(props.dataList);
    const [removeList, setRemoveList] = useState([]);
    const [version, setVersion] = useState(0);

    const add = async () => {
        let id = await getId()
        let newProduct = {
            id: id,
            sku_id: "0",
            sku_name: "请选择",
            price: 0,
            qty: 1,
            version: 0
        }
        let newPakcageList = dataSource.concat(newProduct);
        setDatasource(newPakcageList);
    }
    const handleSelectProduct = (record, product) => {
        dataSource.forEach(d => {
            if (d.sku_id === product.id) {
                message.error("此sku已存在");
                return;
            }
        });
        record.sku_code = product.sku;
        record.sku = product.id;
        record.sku_name = product.display_name;

        let newVersion = version + 1;
        incVersion();
        setVersion(newVersion);
    }
    const incVersion = () => {
        let newVersion = version + 1;
        setVersion(newVersion);
    }

    const remove = (idx) => {
        const entity = dataSource[idx];
 
        if (entity.version != 0) {
            const removeEntity = { ...dataSource[idx] };
            removeEntity.version = -1;
            setRemoveList(removeList.concat(removeEntity));
        }
       
        dataSource.splice(idx, 1);
        const list = [ ...dataSource ];
        setDatasource(list);
        incVersion();
       
    }

    const columns = [
        {
            title: "套餐商品",
            dataIndex: "sku_name",
            width: '40%',
            render: (val, record, idx) => <SearchO2OProduct
                editStatus={'edit'}
                value={val}
                id={record.sku_id}
                onSelect={(r) => handleSelectProduct(record, r)} />
        },
        {
            title: "数量",
            align: 'center',
            dataIndex: "qty",
            render: (va, record) => <InputNumber min={1} defaultValue={record.qty} onChange={(qty) => record.qty = qty} />
        },
        {
            title: "单价",
            align: 'center',
            dataIndex: "price",
            render: (_, record) => <InputNumber min={0} defaultValue={record.price} onChange={(price) => record.price = price} />
        },
        {
            title: "操作",
            align: "center",
            render: (val, record, idx) => (
                <a onClick={() =>remove(idx)}>删除</a>
            )
        }
    ];

    return <div>
        <Table rowKey={'id'} dataSource={dataSource} columns={columns}></Table>
        <Button style={{ flex: 1, justifySelf: 'center', width: "100%" }} onClick={() => add()}>增行</Button>
    </div>

});

class PackageDelModal extends React.PureComponent {
    render() {
        const { data, onCancel, visible, handleDelete, loading } = this.props;
        return (
            <Modal
                title="删除"
                okText="删除"
                confirmLoading={loading}
                visible={visible}
                onOk={() => handleDelete(data.id)}
                onCancel={onCancel}
            >
                确认删除套餐 [{data.package_name}] 吗？
            </Modal>
        )
    }
}

// 套餐管理的编辑
class ProductPackageEditor extends React.Component {
    constructor(props) {
        super(props);
        this.skuListRef = React.createRef();
    }

    state = {
        showProductList: false,
        data: { package_buy_limit: 1, ...this.props.data },
        sku_list: this.props.data && this.props.data.sku_list ? this.props.data.sku_list : [],
    }

    handleProductPopupStatus = () => {
        this.setState({ showProductList: !this.state.showProductList });
    }


    handleSubmit = async () => {
        const newSkuList =  this.skuListRef.current.getSkuList();
        const postData = { ...this.state.data, sku_list: [...newSkuList] };
        this.props.handleSubmit(postData);
    }

    render() {
        const { sku_list, data } = this.state;
        const { visible, onCancel, loading } = this.props;
        return (
            <div>
                <Modal
                    title="套餐内容"
                    style={{ minWidth: '60%' }}
                    onOk={() => this.handleSubmit()}
                    visible={visible}
                    onCancel={() => onCancel()}
                    okText="提交"
                    centered={true}
                    confirmLoading={loading}
                    destroyOnClose={true}>
                    <Form layout='horizontal' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                        <Form.Item required label="套餐名称" name="package_name" initialValue={data && data.package_name}>
                            <Input placeholder="请输入套餐名称" allowClear  onChange={e => data.package_name = e.target.value}  ></Input>
                        </Form.Item>
                        <Form.Item required label='绑定商品'>
                            <SearchO2OProduct
                                editStatus={'edit'}
                                value={data.product}
                                id={data.product_id}
                                onSelect={(r) => {
                                    this.setState({
                                        data: {
                                            ...data,
                                            product_id: r.erp_product.id,
                                            product: r.display_name,
                                            sku: r.id,
                                        }
                                    })
                                }} />
                        </Form.Item>
                        <Form.Item required label="最低购买数" name="package_buy_limit" initialValue={data && data.package_buy_limit ? data.package_buy_limit : 1}>
                            <InputNumber
                                style={{ width: 120 }}
                                min={1} 
                                onChange={val => this.setState({
                                    data: {
                                        ...data,
                                        package_buy_limit: val,
                                    }
                                })} />
                        </Form.Item>
                        {data && data.package_price ? <Form.Item label="套餐单价" name="package_price" initialValue={data.package_price}>
                            <InputNumber style={{ width: 120 }} readOnly min={0} prefix="￥"  ></InputNumber>
                        </Form.Item> : null}

                        <ProductPackageSkuList
                            ref={this.skuListRef}
                            dataList={sku_list} />
                    </Form>

                </Modal>

            </div>
        )
    }
}

// const PackageListSearch = Form.create({ name: 'package_search' })(PackageSearchFilter);
export default ProductPackage;