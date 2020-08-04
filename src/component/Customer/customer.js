
import React, { useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, Input, Form } from 'antd';

import { observer } from 'mobx-react';
import ErpCustomerStore from '../../store/CustomerStore';
const store = new ErpCustomerStore();

@observer
class CustomerLookup extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            product_type_list: 1,
            word_key: '',
        }
    }
    componentDidMount() {
        store.total == 0 ? store.load({ load_color_list: true, return_total: true, product_type_list: 1 }) : null;
    }

    setWordKey = (val) => {
        this.setState({
            word_key: val,
        })
    }

    handleSearch = () => {
        let word_key = this.state.word_key;
        store.handleSearch({
            name: word_key,
            code: word_key,
            pin_yin: word_key,
        })
    }

    render() {
        const { onSelect, setVisible, visible } = this.props;
        return <Modal
            onCancel={() => setVisible(false)}
            visible={visible} width={'50%'}>
            <div style={{ marginTop: 12 ,marginBottom : 8 }}>
                <Form layout='inline' labelAlign='center' ref={this.formRef} onFinish={this.handleSearch}> 
                    <Form.Item>
                        <Input placeholder='客户名称' onChange={e => this.setState({ word_key: e.target.value})} />
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit'  icon={<SearchOutlined />}>查询</Button>
                    </Form.Item>
                </Form>
            </div>

            <Table size='middle' bordered rowKey={'id'}
                loading={store.loading}
                dataSource={store.dataList}
                pagination={{
                    current: store.page,
                    page_size: store.pageSize,
                    total: store.total,
                    onChange: store.onPageChange
                }}>
                <Table.Column dataIndex='code' title='编码'></Table.Column>
                <Table.Column dataIndex='name' title='名称'></Table.Column>
                <Table.Column dataIndex='id' title='' render={(_, record) => <a onClick={() => {
                    setVisible(false);
                    onSelect(record);
                }
                }>选择</a>}></Table.Column>
            </Table>
        </Modal>

    }
}

export const PopoverCustomer = ({ onSelect }) => {
    const [visible, setVisible] = useState(false);
    return visible ? <CustomerLookup visible={visible} onSelect={onSelect} setVisible={setVisible} /> :
        <Button type='dashed' onClick={() => setVisible(true)}><PlusOutlined /></Button>;

}

