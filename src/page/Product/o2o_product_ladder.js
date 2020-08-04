import React, { useState, useImperativeHandle } from 'react';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Divider, Button, Modal, InputNumber, Input, message, Form } from 'antd';
import { SearchO2OProduct } from '../../component/O2O/LookupO2OProduct';
import { getId } from '../../util/api';

const ProductLadder = () => {
    const [editStatus, setEditStatus] = useState(false)
    const columns = [
        {
            title: "sku",
            dataIndex: 'sku'
        },
        {
            title: "商品名称",
            dataIndex: "display_name"
        },
        {
            title: '活动价规则',
            dataIndex: 'ladder_rule'
        },
        {
            title: '操作',
            render: () => <span><a>编辑</a><Divider /><a>删除</a></span>
        }
    ]
    const add = () => {
        setEditStatus(true)
    }
    return (
        <div>
            <Card title='活动价管理'>
                {/* <PackageListSearch handleSubmit={loadPackageList} loading={loading} /> */}
            </Card>

            <Card style={{ marginTop: 10 }}>
                <Button type='primary' style={{ marginBottom: 5 }} onClick={() => add()}>新建</Button>
                <Table
                    columns={columns}
                >

                </Table>
            </Card>
            {editStatus ? <LadderEditor visible={editStatus} onCancel={() => setEditStatus(false)} /> : null}
        </div>
    )
}

// @Form.create()
class LadderEditor extends React.PureComponent {
    formRef = React.createRef();
    constructor(props) {
        super(props);
        this.ladderListRef = React.createRef();
        this.state = {
            ladderList: this.props.data ? this.props.data.ladderList : []
        }
    }

    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!values.id) {
                message.warn('请选择产品')
                return
            }
                const newLadderList = this.ladderListRef.current.getLadderList();
                if (newLadderList.length === 0) {
                    message.warn('请添加阶梯信息')
                    return
                }
                for (let idx in newLadderList) {
                    if (newLadderList[idx].remark === '') {
                        message.warn('活动名称不完整')
                        return
                    }
                }
        });

    }

    render() {
        const { visible, onCancel, data } = this.props;
        // const { getFieldDecorator } = form;
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
        const { ladderList } = this.state
        return (
            <Modal
                title="活动价格设置"
                width={760}
                okText="确认"
                onOk={this.handleSubmit}
                visible={visible}
                destroyOnClose={true}
                onCancel={() => onCancel()}>
                <Form ref={this.formRef} {...formItemLayout}>
                    <Form.Item name="id" style={{ display: 'none' }}>
                        {/* {getFieldDecorator('id', {
                            initialValue: data && data.id
                        })} */}
                    </Form.Item>
                    <Form.Item label="产品名称" name="display_name">
                            <SearchO2OProduct
                                editStatus={'edit'}
                                id={data && data.id}
                                onSelect={(val) => {
                                    form.setFieldsValue({
                                        id: val.id,
                                        display_name: val.display_name,
                                        sku: val.sku,
                                    })
                                }} />
                        {/* {getFieldDecorator('display_name', {
                            initialValue: data && data.display_name
                        })(
                            <SearchO2OProduct
                                editStatus={'edit'}
                                id={data && data.id}
                                onSelect={(val) => {
                                    form.setFieldsValue({
                                        id: val.id,
                                        display_name: val.display_name,
                                        sku: val.sku,
                                    })
                                }} />
                        )} */}
                    </Form.Item>
                    <Form.Item label="sku" name="sku">
                    <Input readOnly placeholder='sku'></Input>
                        {/* {getFieldDecorator('sku', {
                            initialValue: data && data.sku
                        })(<Input readOnly placeholder='sku'></Input>)} */}
                    </Form.Item>
                    <Divider type='horizontal'>阶梯信息</Divider>
                    <ProductLadderList
                        ref={this.ladderListRef}
                        dataList={ladderList}
                    />
                </Form>
            </Modal>
        )
    }

}

const ProductLadderList = React.forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        getLadderList() {
            return dataSource;
        },
    }));
    const [dataSource, setDataSource] = useState(props.dataList)

    const add = async () => {
        let id = await getId()
        let newProduct = {
            id: id,
            num: 1,
            discount: 0,
            remark: ''
        }
        let newLadderRow = dataSource.concat(newProduct);
        setDataSource(newLadderRow);
    }

    const remove = (idx) => {
        let dataList = dataSource
        dataList.splice(idx, 1)
        setDataSource([...dataList])
    }

    const columns = [
        {
            title: '活动名称',
            dataIndex: "remark",
            render: (val, record) => <Input placeholder='请输入活动名称' onChange={(e) => record.remark = e.target.value} defaultValue={val} />
        },
        {
            title: '数量',
            dataIndex: 'num',
            render: (val, record) =>
                <InputNumber min={1} onChange={(num) => record.num = num} defaultValue={val}></InputNumber>
        },
        {
            title: '优惠价',
            dataIndex: 'discount',
            render: (val, record) =>
                <InputNumber min={0} onChange={(discount) => record.discount = discount} defaultValue={val}></InputNumber>
        },
        {
            render: (val, record, idx) => <a onClick={() => remove(idx)}>X</a>
        }
    ]

    return (
        <div>
            <Table rowKey={'id'} dataSource={dataSource} columns={columns}></Table>
            <Button style={{ flex: 1, justifySelf: 'center', width: "100%" }} onClick={() => add()}>增行</Button>
        </div>
    )
})

export default ProductLadder;