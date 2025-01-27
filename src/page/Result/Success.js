import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DingdingOutlined } from '@ant-design/icons';
import { Button, Row, Col, Steps, Card } from 'antd';
import { Result } from 'ant-design-pro';

const { Step } = Steps;

const desc1 = (
  <div
    style={{
      fontSize: 12,
      color: 'rgba(0, 0, 0, 0.45)',
      position: 'relative',
      left: 42,
      textAlign: 'left'
    }}
  >
    <div style={{ margin: '8px 0 4px' }}>
      <span>曲丽丽</span>
      <DingdingOutlined style={{ marginLeft: 8 }} />
    </div>
    <div>2016-12-12 12:32</div>
  </div>
);

const desc2 = (
  <div
    style={{
      fontSize: 12,
      position: 'relative',
      left: 42,
      textAlign: 'left'
    }}
  >
    <div style={{ margin: '8px 0 4px' }}>
      <span>周毛毛</span>
      <DingdingOutlined style={{ color: '#00A0E9', marginLeft: 8 }} />
    </div>
    <div>
      <a href="">
        <span>催一下</span>
      </a>
    </div>
  </div>
);

const extra = (
  <Fragment>
    <div
      style={{
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.85)',
        fontWeight: '500',
        marginBottom: 20
      }}
    >
      <span>项目名称</span>
    </div>
    <Row style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={12} lg={12} xl={6}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          <span>项目 ID：</span>
        </span>
        23421
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={6}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          <span>负责人：</span>
        </span>
        <span>曲丽丽</span>
      </Col>
      <Col xs={24} sm={24} md={24} lg={24} xl={12}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          <span>生效时间：</span>
        </span>
        2016-12-12 ~ 2017-12-12
      </Col>
    </Row>
    <Steps style={{ marginLeft: -42, width: 'calc(100% + 84px)' }} progressDot current={1}>
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            创建项目
          </span>
        }
        description={desc1}
      />
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            部门初审
          </span>
        }
        description={desc2}
      />
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            财务复核
          </span>
        }
      />
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            完成
          </span>
        }
      />
    </Steps>
  </Fragment>
);

const actions = (
  <Fragment>
    <Button type="primary">
      <Link to="/project/list/search">返回列表</Link>
    </Button>
    <Button>
      查看项目
    </Button>
    <Button>
      打印
    </Button>
  </Fragment>
);

export default () => (
  <Card
    bordered={false}
    style={{
      marginTop: 24,
      marginRight: 24,
      marginBottom: 0,
      marginLeft: 24
    }}
  >
    <Result
      type="success"
      title="提交成功"
      description="提交结果页用于反馈一系列操作任务的处理结果， 如果仅是简单操作，使用 Message 全局提示反馈即可。 本文字区域可以展示简单的补充说明，如果有类似展示 “单据”的需求，下面这个灰色区域可以呈现比较复杂的内容。"
      extra={extra}
      actions={actions}
      style={{ marginTop: 48, marginBottom: 16 }}
    />
  </Card>
);
