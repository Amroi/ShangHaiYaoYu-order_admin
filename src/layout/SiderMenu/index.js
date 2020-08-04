import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Menu } from 'antd';
import menus from '../../menus'
const { SubMenu } = Menu;

// import style from './style.less';

@withRouter
class SiderMenu extends Component {
  handleMenuClick = ({ key }) => {
    const { history } = this.props;

    if (key === '/project') {
      history.push(key);
    }
  }

  genMenus = (menus)=> {
    return menus.map(item=> {
      if(item.children && Array.isArray(item.children)) {
         return (
           <SubMenu key={item.path} title={<span><LegacyIcon type={item.icon} /><span>{item.name}</span></span>} >
               { this.genMenus(item.children)}
            </SubMenu>
         );    
      }else {
        return <Menu.Item key={item.path} ><Link to={item.path}> <LegacyIcon type={item.icon} />{item.name}</Link></Menu.Item>;
      
      }  
    });
  }
  render() {
    const { collapsed, location } = this.props;
    const items =  this.genMenus(menus);
    return (
      <Menu
        defaultSelectedKeys={['/project']}
        selectedKeys={[location.pathname]}
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        onClick={this.handleMenuClick}
      >
       
         {items}
       
        
      </Menu>
    );
  }
}

export default SiderMenu;
