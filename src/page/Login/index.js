import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import cssModules from 'react-css-modules';

import styles from './style.less';
import { Link, withRouter } from 'react-router-dom';
import AppFooter from '../../component/AppFooter';

@withRouter
@inject('loginStore')
@observer
@cssModules(styles)
class LoginPage extends React.Component {
  state = {
    company_id: '1000',
    name: '',
    password: '',
  };

  componentDidMount = () => {
    this.props.loginStore.getCompanyList();
  }

  componentWillUnmount = () => {
    this.setState({
      company_id: '1000',
      name: '',
      password: '',
    })
  }

  handleSubmit = async () => {
    const loginParams = {};
    const { company_id, name, password } = this.state;
    loginParams.company_id = company_id;
    loginParams.name = name;
    loginParams.password = password;
    const resp = await this.props.loginStore.doLogin(loginParams);
    if (resp.success) {
      this.props.history.push("/");
    } else {
      message.error(resp.msg);
    }
  };

  render() {
    const { companyList } = this.props.loginStore;
    return (
      <div styleName="container">
        <div styleName="content">
          <div styleName="top">
            <div styleName="header">
              <Link to="/">
                <img className={styles.logo} src='favicon.png' alt="logo" />
                <span styleName="title">智客手机管理系统</span>
              </Link>
            </div>
          </div>
          <div styleName='login' style={{ marginTop: 40 }}>
            <Form onSubmit={this.handleSubmit}>
              <Form.Item>
                <Select size='large' name="company" onChange={(val) => this.setState({ company_id: val })} style={{ width: '100%', marginBottom: 0 }} placeholder='公司'>
                  {companyList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item>
                <Input placeholder='账号' onChange={e => this.setState({ name: e.target.value })} />
              </Form.Item>
              <Form.Item>
                <Input placeholder='密码' type='password' onChange={e => this.setState({ password: e.target.value })} />
              </Form.Item>
              <Form.Item>
                <Button htmlType='submit' onClick={this.handleSubmit} type='primary' style={{ width: '100%' }}>登录</Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }
}

export default LoginPage;
