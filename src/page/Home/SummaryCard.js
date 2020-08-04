import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Charts } from 'ant-design-pro';
import styles from './style.less';

const { ChartCard } = Charts;

@cssModules(styles)
class SummaryCard extends Component {
  render() {
    const { total, title, intro, loading } = this.props;
    return (
      <ChartCard
        loading={loading}
        title={title}
        action={
          <Tooltip title={intro}>
            <InfoCircleOutlined />
          </Tooltip>
        }
        total={total}
      />
    );
  }
}

export default SummaryCard;
