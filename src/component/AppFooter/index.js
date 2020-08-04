import React from 'react';
import cssModules from 'react-css-modules';
import { CopyrightOutlined } from '@ant-design/icons';
import styles from './style.less';
import GlobalFooter from '../GlobalFooter';

@cssModules(styles)
class AppFooter extends React.Component {
  static defaultProps = {
    links: [
      {
        key: 'help',
        title: '帮助',
        href: ''
      },
      {
        key: 'privacy',
        title: '隐私',
        href: ''
      },
      {
        key: 'terms',
        title: '条款',
        href: ''
      }
    ],
    copyright: (
      <div>
        <p>Copyright <CopyrightOutlined /> {new Date().getFullYear()} 智客技术部出品</p>
      </div>
    )
  }

  render() {
    const { copyright } = this.props;

    return <GlobalFooter copyright={copyright} />
  }
}

export default AppFooter;
