
import React, { Component } from 'react';
import { /* Link, */ withRouter } from 'react-router-dom';
import cssModules from 'react-css-modules';
import { LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu, Dropdown, /* Avatar, */Tooltip } from 'antd';
import SiderMenu from 'layout/SiderMenu';
import loginUtil from 'util/login';
import styles from './style.less';
import ajax from '../../util/api/ajax';

const { Header, Sider, Content } = Layout;

@withRouter
@cssModules(styles, {
  allowMultiple: true
})
class App extends Component {
  state = {
    collapsed: false
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      loginUtil.logout();
      this.props.history.push('/login');
    }
  }
  
  async componentDidMount() {
    window._routers = this.props.history;
     let resp = await ajax({url: '/erp/user/current', method: "POST"});
     if(resp.success) {
       loginUtil.saveUserInfo(resp.user);
     }  
  }
  render() {
    const { collapsed } = this.state;

    const userInfo = loginUtil.getUserInfo() || {};

    const menu = (
      <Menu className="user-menu" selectedKeys={[]} onClick={this.handleMenuClick}>
       
        <Menu.Item key="logout">
          <LogoutOutlined />
          退出登录
        </Menu.Item>
      </Menu>
    );

    return (
      <Layout>
        <Sider
          trigger={true}
          collapsible
          width={200}
          collapsed={this.state.collapsed}
        >
          <div styleName="logo">
            <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="logo" />
            <h1>{collapsed ? '' : '订单系统'}</h1>
          </div>
          <SiderMenu collapsed={collapsed} />
        </Sider>
        
        <Layout>  
                  
          <Content>
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default App;
