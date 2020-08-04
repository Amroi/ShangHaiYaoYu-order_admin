import React from "react";
import { observer, inject } from 'mobx-react';
import {  withRouter } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, List, Card, Modal } from "antd";
import Ellipsis from '../../component/Ellipsis';
import styles from './AccountList.less';
import AccountEdit from './AccountEdit';

// 删除付款帐号卡片
class DelModal extends React.PureComponent {
  render() {
    const { visible, data, handleCancel, loading, handleDelete } = this.props;
    return (
      <Modal
        width={400}
        title="删除"
        visible={visible}
        okText="确认"
        onOk={handleDelete}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <div>确定删除开户行为 <span style={{ color: 'red' }}>{data.bank_owner || data.bank_type}</span>  的帐号  <span style={{ color: 'red' }}>{data.card_no}</span> 吗？</div>
      </Modal>
    )
  }
}

// 付款帐号
@withRouter
@inject("o2oAccountStore")
@observer
export default class AccountList extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.o2oAccountStore.fetch();
    }

      render() {
        const { data, loading, editVisible, changeEditVisible, editData, handleSubmit, changeDelVisible, delData, delVisible, handleDelete } = this.props.o2oAccountStore;
        return (
          <div>
          <Card title='付款帐号'>
          <div className={styles.cardList}>
            <List
              rowKey="id"
              loading={loading}
              grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
              dataSource={['', ...data]}
              renderItem={item =>
                item ? (
                  <List.Item key={item.id}>
                      <Card style={{width : 407 }}
                          hoverable
                          className={styles.card}
                          actions={[
                            <EditOutlined onClick={() => changeEditVisible(item)} key="edit" />, 
                            <DeleteOutlined onClick={() => changeDelVisible(item)} key="delete" />]}
                      >
                          <Card.Meta 
                              avatar={<img alt="" className={styles.cardAvatar} src={item.card_no_url} />}
                              title={item.bank_type}
                              description={
                                  <Ellipsis className={styles.item} lines={4}>
                                      <h4>户名：{item.owner} </h4>
                                      <h4>账号：{item.card_no} </h4>
                                      <h4>开户银行：{item.bank_owner ? item.bank_owner : item.bank_type} </h4>
                                      <h4>状态：{item.status ? '正常' : '禁用'} </h4>
                                  </Ellipsis>
                              }
                          />
                      </Card>
                  </List.Item>
                ) : (
                  <List.Item>
                      <Button
                          type="dashed"
                          onClick={() => changeEditVisible(item)}
                          className={styles.newButton}
                      >
                          <PlusOutlined />
                          新增
                      </Button>
                  </List.Item>
                )
              }
            />
          </div>
          </Card>
          {editVisible ? (
            <AccountEdit
              loading={loading}
              visible={editVisible}
              data={editData}
              handleOk={handleSubmit}
              handleCancel={() =>changeEditVisible(null)}
            />
          ) : null}
          {delVisible ? (<DelModal
            loading={loading}
            visible={delVisible}
            data={delData}
            handleDelete={handleDelete}
            handleCancel={() =>changeDelVisible(null)}/>) : null}
        </div>
        );
      }
}