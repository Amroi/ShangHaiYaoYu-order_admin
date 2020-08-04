import React, { Component } from 'react';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Radio, Select, Checkbox, Form } from 'antd';
import { SingleImageUpload } from '../../component/O2O/ZksoftUpload';
import LookupBankAccount from '../../component/O2O/LookupBankAccount';

// 付款帐号的新增管理
export default class AccountEdit extends Component {
  formRef = React.createRef();
   handleOk =  () => {
    const { data } = this.props;
    this.formRef.current.validateFields().then( values => {
      
      let rights = '';
      for (let index in values.orderPriceRule) {
        if (index != values.orderPriceRule.length - 1) {
          rights += values.orderPriceRule[index] + ',';
        } else {
          rights += values.orderPriceRule[index];
        }
      }

      let reqData = { ...values };
      reqData.bind_id = values.bind_account.id;
      reqData.bind_name = values.bind_account.name;
      reqData.id = data.id;
      reqData.rights = rights;
      reqData.auto_confirm = values.auto_confirm ? 2 : 1;
      this.props.handleOk(reqData);
    });
  };

  render() {
    const { visible, data, handleCancel, loading } = this.props;
    // const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 26 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 26 },
        sm: { span: 16 },
      },
    };
    return (
      <Modal
        width={600}
        visible={visible}
        okText="提交"
        onOk={this.handleOk}
        closable={false}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form ref={this.formRef} initialValues={{ 
            owner : data.owner , 
            card_no : data.card_no,
            bank_type : data.bank_type,
            bank_owner : data.bank_owner,
            bind_account : data ? { id: data.bind_id, name: data.bind_name } : null,
            orderPriceRule : data && data.rights != '' ? data.rights.split(',') : ['default'],
            status : data.status,
            auto_confirm : data.auto_confirm === 2, 
            card_no_url : data.card_no_url
          }}>
          <Form.Item label="户名" name="owner" {...formItemLayout}
          rules={[
            {
              required: true,
              message: '请输入户名',
            }
          ]}>
          <Input />
            {/* {getFieldDecorator('owner', {
              initialValue: data.owner,
              rules: [
                {
                  required: true,
                  message: '请输入户名',
                },
              ],
            })(<Input />)} */}
          </Form.Item>
          <Form.Item label="账号" name="card_no" {...formItemLayout}
          rules={ [
            {
              required: true,
              message: '请输入账号',
            }
          ] }>
          <Input />
            {/* {getFieldDecorator('card_no', {
              initialValue: data.card_no,
              rules: [
                {
                  required: true,
                  message: '请输入账号',
                },
              ],
            })(<Input />)} */}
          </Form.Item>
          <Form.Item label="开户银行" name="bank_type" {...formItemLayout}
          rules={ [
            {
              required: true,
              message: '请输入开户行',
            }
          ]}
          >
          <Input />
            {/* {getFieldDecorator('bank_type', {
              initialValue: data.bank_type,
              rules: [
                {
                  required: true,
                  message: '请输入开户行',
                },
              ],
            })(<Input />)} */}
          </Form.Item>
          <Form.Item label="开户地址" name="bank_owner" {...formItemLayout}>
            {/* {getFieldDecorator('bank_owner', {
              initialValue: data.bank_owner,
              // rules: [
              //     {
              //         required: false,
              //         message: "请输入开户地址"
              //     }
              // ]
            })(<Input />)} */}
            <Input />
          </Form.Item>
          <Form.Item label="绑定账户" name="bind_account" {...formItemLayout}
          rules={ [
            {
              required: true,
              message: '请选择绑定账户',
            }
          ] }
          >
            {/* {getFieldDecorator('bind_account', {
              initialValue: data ? { id: data.bind_id, name: data.bind_name } : null,
              rules: [
                {
                  required: true,
                  message: '请选择绑定账户',
                },
              ],
            })(<LookupBankAccount />)} */}
            <LookupBankAccount />
          </Form.Item>
          <Form.Item label="客户类型" name="orderPriceRule" {...formItemLayout}
          rules={ [
            {
              required: true,
              message: '请选择客户类型',
            }
          ] }
          >
            {/* {getFieldDecorator('orderPriceRule', {
              initialValue: data && data.rights != '' ? data.rights.split(',') : ['default'],
              rules: [
                {
                  required: true,
                  message: '请选择客户类型',
                },
              ],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
              >
                <Select.Option key='default' value='default'>默认</Select.Option>
                <Select.Option key='qu_dao' value='qu_dao'>渠道</Select.Option>
                <Select.Option key='te_shu' value='te_shu'>特殊</Select.Option>
              </Select>
            )} */}
              <Select
                mode="multiple"
                style={{ width: '100%' }}
              >
                <Select.Option key='default' value='default'>默认</Select.Option>
                <Select.Option key='qu_dao' value='qu_dao'>渠道</Select.Option>
                <Select.Option key='te_shu' value='te_shu'>特殊</Select.Option>
              </Select>
          </Form.Item>
          <Form.Item label="状态" name="status" {...formItemLayout}
          rules={ [
            {
              required: true,
              message: '请选择状态',
            }
          ]}>
            {/* {getFieldDecorator('status', {
              initialValue: data.status,
              rules: [
                {
                  required: true,
                  message: '请选择状态',
                },
              ],
            })(
              <Radio.Group buttonStyle="solid">
                <Radio.Button value={true}>正常</Radio.Button>
                <Radio.Button value={false}>禁用</Radio.Button>
              </Radio.Group>
            )} */}
              <Radio.Group buttonStyle="solid">
                <Radio.Button value={true}>正常</Radio.Button>
                <Radio.Button value={false}>禁用</Radio.Button>
              </Radio.Group>
          </Form.Item>
          <Form.Item {...formItemLayout} name="auto_confirm" valuePropName ="checked" label="自动过账" required>
            {/* {getFieldDecorator("auto_confirm", {
              initialValue: data.auto_confirm === 2, valuePropName: 'checked',
            })(
              <Checkbox />
            )} */}
            <Checkbox />
          </Form.Item>
          <Form.Item label="图片" name="card_no_url" {...formItemLayout}>
            {/* {getFieldDecorator('card_no_url', {
              initialValue: data.card_no_url,
              // rules: [
              //     {
              //         required: false,
              //         message: "请上传图片"
              //     }
              // ]
            })(<SingleImageUpload />)} */}
            <SingleImageUpload />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
