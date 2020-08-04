
import React, { useState, useEffect } from 'react'
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Modal, Input, Select, Button, Form } from 'antd';
import { ErpProductStore } from '../../store/ProductStore';
import { ErpProductColorStore } from '../../store/ColorStore';
import { observer } from 'mobx-react';

const store = new ErpProductStore();
const color_store = new ErpProductColorStore();

@observer
class ProductLookup extends React.Component {
    formRef = React.createRef();
    constructor(props) {
        super(props);
        this.state = { 
            product_type_list: 1, 
            name: "",
            code: "",
            pin_yin: "",
            load_color_list: true,
            ...props.filter,
        };
    }
    handleSelectProductType = (val) => {
        this.setState({ product_type_list: val });
    }

    handleSearch = () => {
        store.handleSearch({ return_total: true, ...this.state });
    }
    
    componentDidMount() {
        // 获取商品分类数据
        store.queryTypeList();
        store.total == 0 ? store.load({ load_color_list: this.props.show_color ? true : false, return_total: true, ...this.state }) : null;
    }

    render() {
        const { onSelect, visible, onClose } = this.props;
        let typeList = store.prodTypeList ? store.prodTypeList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>) : [];
        return <Modal
            onCancel={onClose}
            visible={visible} width={'50%'}>
            <div style={{ marginTop: 20,marginBottom: 5 }}>
                <Form ref = {this.formRef}  layout='inline' labelAlign='center' onFinish={ this.handleSearch }>
                    <Form.Item>
                        <Select defaultValue='1' onSelect={this.handleSelectProductType} style={{ width: 140 }}>
                            {typeList}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Input.Search placeholder='商品名称' onChange={e => { const val = e.target.value; this.setState({ name: val, code: val, pin_yin: val })}} 
                        onSearch={(val) => {
                            this.setState({
                                name: val,
                                code: val,
                                pin_yin: val,
                                load_color_list: true,
                            })
                            store.handleSearch({
                                ...this.state,
                                name: val,
                                code: val,
                                pin_yin: val,
                                load_color_list: true,
                            })
                        }
                            } />
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ marginLeft: 10 }} loading={store.loading} type="primary" htmlType="submit" >查询</Button>
                    </Form.Item>
                </Form>
            </div>

            <Table bordered rowKey={'key'} loading={store.loading} dataSource={store.dataList} pagination={{
                current: store.page,
                page_size: store.pageSize,
                total: store.total,
                onChange: store.onPageChange
            }}>
                <Table.Column dataIndex='code' title='编码'></Table.Column>
                <Table.Column dataIndex='name' title='名称'></Table.Column>
                {this.props.show_color ? <Table.Column dataIndex='color' title='颜色'></Table.Column> : null}
                <Table.Column dataIndex='id' title='' render={(_, record) => <a onClick={() => {
                    onSelect(record);
                }
                }>选择</a>}></Table.Column>
            </Table>
        </Modal>

    }
}

@observer
class ProductColorLookup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            product_type_list: 1,
        }
    }
    componentDidMount() {
        color_store.load_product_color_list(this.props.product_id);
    }

    render() {
        const { onSelect, setVisible, visible, onClose } = this.props;
        return <Modal
            footer={null}
            onCancel={onClose}
            visible={visible} width={350}>

            <Table size='middle' header={false} bordered rowKey={'id'} loading={color_store.loading} dataSource={color_store.dataList} pagination={false}>
                <Table.Column dataIndex='name' title='名称' />
                <Table.Column dataIndex='id' title='名称'
                    render={(val, record) =>
                        <span>  <a style={{ color: 'blue', marginLeft: 10 }}
                            onClick={() => { onSelect(record) }}>选择</a></span>} />
            </Table>
        </Modal>
    }
}

@observer
class ProductBrandLookup extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        color_store.load_product_color_list(this.props.product_id);
    }

    render() {
        const { onSelect, setVisible, visible } = this.props;
        return (
            <Modal
                footer={null}
                onCancel={() => setVisible(false)}
                visible={visible} width={350}>

                <Table size='middle' header={false} bordered rowKey={'id'} loading={color_store.loading} dataSource={color_store.dataList} pagination={false}>
                    <Table.Column dataIndex='name' title='名称'
                        render={(val, record) =>
                            <span> {val}<CheckOutlined
                                style={{ color: 'blue', marginLeft: 10 }}
                                onClick={() => { setVisible(false); onSelect(record) }} /></span>} />
                </Table>
            </Modal>
        );

    }
}

export const SelectProduct = ({ onSelect, product = {}, filter, show_color }) => {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState(product);
    const handleSelect = (entity) => {
        setValue(entity);
        if (onSelect) {
            onSelect(entity);
        }
        setVisible(false);
    }
    return <div>
        <Input.Search value={value.name} style={{ minWidth: 100 }} onSearch={() => setVisible(!visible)} />
        {visible ?
            <ProductLookup
                show_color={show_color}
                onClose={() => setVisible(false)}
                filter={filter ? filter : {}}
                visible={visible}
                onSelect={handleSelect} /> : null}
    </div>
}

export const PopoverProductBrand = ({ onSelect, product_id }) => {
    const [visible, setVisible] = useState(false);
    return visible ? <ProductColorLookup product_id={product_id} visible={visible} onSelect={onSelect} setVisible={setVisible} /> :
        <SearchOutlined onClick={() => setVisible(true)} />;
}

export const SelectProductColor = ({ onSelect, product_id, color }) => {
    const [visible, setVisible] = useState(false);
    const [newColor, setColor] = useState(color ? color : {});

    useEffect(() => {
        handleSelect(color)
    }, [color.name]);

    const handleSelect = (entity) => {
        setColor(entity);
        if (onSelect) {
            onSelect(entity);
        }
        setVisible(false);
    }
    return <div>
        <Input.Search value={newColor.name} style={{ minWidth: 100 }} onSearch={() => setVisible(!visible)} />
        {visible ?
            <ProductColorLookup product_id={product_id} visible={visible}
                onSelect={handleSelect} onClose={() => setVisible(false)} /> : null}
    </div>
}