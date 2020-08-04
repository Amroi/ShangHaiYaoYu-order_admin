import React, { Component } from 'react';
// import { PropTypes } from 'prop-types';
import { inject, observer } from 'mobx-react';
import cssModules from 'react-css-modules';
import moment from 'moment';
import { Card } from 'antd';
import Dashboard from './Dashboard';
import LineChart from './LineChart';
import styles from './style.less';

@inject('homeStore')
@observer
@cssModules(styles)
class Home extends Component {
  async componentDidMount() {
    const { onWillMount } = this.props.homeStore;
    await onWillMount(); 
    
  }

  onChange = () => {

  }

  getRagnes = () => {
    
    const endDate = moment();

    return {
      今日: [moment(), endDate],
      本周: [moment().startOf('week'), endDate],
      本月: [moment().startOf('month'), endDate],
      本年: [moment().startOf('year'), endDate]
    };
  }

  render() {
    const {
      loading,
      amount,
      pv,
      rate,
      count,
      indicators,
      chartOptions,
      changeIndicator,
      changeDateRange
    } = this.props.homeStore;

    return (
      <div style={{ backgroundColor: '#f0f2f5' }}>
        <Card style={{ backgroundColor: '#f0f2f5' }} bordered={false}>
          <Dashboard
            loading={loading}
            amount={amount}
            pv={pv}
            rate={rate}
            count={count}
          />
          <LineChart
            loading={loading}
            ranges={this.getRagnes()}
            indicators={indicators}
            chartOptions={chartOptions}
            onIndicatorChange={changeIndicator}
            onRangeChange={changeDateRange}
          />
        </Card>
      </div>
    );
  }
}

export default Home;
