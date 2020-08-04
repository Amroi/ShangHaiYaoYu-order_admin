import React from 'react';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { message } from 'antd';
import styles from './ViewPic.less';

class ViewPic extends React.PureComponent {
  state = {
    imgWidth: 600,
    mul: 1,
  }
  handleImgWidthChange = (val) => {
    let newMul = this.state.mul + val;
    if (newMul <= 0) {
      message.warn("无法继续缩小");
      return;
    }
    if (newMul > 4) {
      message.warn("无法继续放大");
      return;
    }
    this.setState({
      mul: newMul,
    });
  }
  render() {
    const { picUrl, src } = this.props;
    const { imgWidth, mul } = this.state;
    let imageWidth = imgWidth * mul;
    return (
      <div>
        <div className={styles.picFrame}>
          <img width={imageWidth} src={src ? src : picUrl + "?x-oss-process=image/resize,m_lfit,1240,w_1240"} />
        </div>
        {(src || picUrl) && <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a title='放大' className={styles.zoom} onClick={() => this.handleImgWidthChange(0.25)}>
          <ZoomInOutlined style={{ fontSize: '26px' }} />
          </a>
          <a title='缩小' className={styles.zoom} onClick={() => this.handleImgWidthChange(-0.25)}>
          <ZoomOutOutlined style={{ fontSize: '26px' }} />
          </a>
          {/* <Icon style={{fontSize: '26px', marginLeft: 10}} type="redo" /> */}
        </div>
        }
      </div>
    );
  }
}

export default ViewPic;