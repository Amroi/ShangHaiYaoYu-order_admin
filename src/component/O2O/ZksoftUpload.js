import React from 'react';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Upload, Modal, message, Row, Col, Button } from 'antd';
import styles from './styles/upload.less';
import Cropper from 'react-cropper';
import ajax from '../../util/api/ajax';
import '../../../node_modules/cropperjs/dist/cropper.css';
import { stringify } from 'qs';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.onload = e => callback(e);
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    message.error('请选择 JPEG/PNG 文件!');
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('文件必须小于5M!');
    return false
  }

  return true
}

// 单个文件上传
export class SingleImageUpload extends React.Component {
  state = {
    loading: false,
    imageUrl: this.props.value,
    uploading: false,
    previewVisible: false,
    previewImage: '',
    croppUrl: this.props.value,
    fileList: this.props.value ? [{ uid: -1, name: 'file', status: 'done', url: this.props.value }] : [],
  };
  uploadProductImage = (data, param) => {
    const resp = ajax({ url: `/erp/o2o/user/image/upload?${stringify(data)}`, method: 'post', data: param })
    return resp
  }

  showPreview = (file) => {
    this.setState({ previewVisible: true });
  };

  handleRemove = () => {
    this.props.onChange('')
    this.setState({
      fileList: []
    })
  }

  handleUpload = () => {
    if (this.state.uploading) {
      return;
    }
    const { selectImgName } = this.state;

    this.cropper.getCroppedCanvas().toBlob(async blob => {
      // 创造提交表单数据对象
      const formData = new FormData();
      // 添加要上传的文件
      const t = new Date().getTime();
      formData.append('file', blob, selectImgName);
      // 提示开始上传
      this.setState({ uploading: true });
      // 上传图片
      const resp = await this.uploadProductImage({ id: t }, formData);
      if (!resp) {
        message.error('上传文件失败');
        return;
      }

      // 上传成功, 返回图片URL
      if (resp.success) {
        this.props.onChange ? this.props.onChange(resp.data.url) : null;
        this.setState({
          fileList: [resp.data]
        })
        message.success('图片上传成功');
        // 提示上传完毕
        this.setState({ previewVisible: false, imageUrl: resp.data.url, uploading: false });
      } else {
        message.warn(resp.msg)
        this.setState({ uploading: false });
      }

    });
  };

  handleBeforeUpload = file => {
    // 检查文件大小
    if (!beforeUpload(file)) {
      return;
    }

    getBase64(file, e =>
      this.setState({
        croppUrl: e.target.result, //cropper的图片路径
        selectImgName: file.name, //文件名称
        selectImgSize: file.size / 1024 / 1024, //文件大小
        selectImgSuffix: file.type.split('/')[1], //文件类型
        previewVisible: true, //打开控制裁剪弹窗的变量，为true即弹窗
      })
    );
    return false;
  };

  showUploadModal = e => {
    e.preventDefault();
    this.setState({ previewVisible: true, uploading: false });
  };
  render() {
    const uploadButton = (
      <div>
        <LegacyIcon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    const { imageUrl, croppUrl, fileList } = this.state;
    for (let i in fileList) {
      if (fileList[i].url.indexOf("h_1240") === -1) {
        fileList[i].url = fileList[i].url + '?x-oss-process=image/resize,m_lfit,h_1240,w_1240';
      }
    }
    const uploadProps = {
      listType: 'picture-card',
      className: this.props.big ? styles.bigImageUpload : this.props.long ? styles.longImageUpload : styles.smallProductImageUpload,
      onPreview: this.showPreview,
      onRemove: this.handleRemove,
      showUploadList: { showPreviewIcon: false, showRemoveIcon: true },
      beforeUpload: this.handleBeforeUpload,
      fileList: fileList
    };
    return (
      <div style={{ float: 'left' }}>
        {this.state.previewVisible ? (
          <Modal
            title="图片上传,请确保图像清晰"
            key="cropper_img_modal_key"
            width={'60%'}
            onOk={this.handleUpload}
            confirmLoading={this.state.uploading}
            onCancel={() => this.setState({ uploading: false, previewVisible: false })}
            visible={this.state.previewVisible}
          >
            {/* <Upload {...uploadProps} style={{ backgroundColor: 'white' }} onPreview={false}>
              <Button>
                <Icon type="upload" /> 上传文件
              </Button>
            </Upload> */}

            <Row gutter={16}>
              <Col span={10}>
                <Cropper
                  style={{ height: 400, width: '100%' }}
                  minCanvasHeight={320}
                  minCanvasWidth={320}
                  src={croppUrl} //图片路径，即是base64的值，在Upload上传的时候获取到的
                  ref={cropper => (this.cropper = cropper)}
                  autoCropArea={1.0}
                  modal={false}
                  preview=".cropper-preview"
                  className="company-logo-cropper"
                  viewMode={1} //定义cropper的视图模式
                  zoomable={false} //是否允许放大图像
                  guides={true} //显示在裁剪框上方的虚线
                  background={true} //是否显示背景的马赛克
                  rotatable={false} //是否旋转
                />
              </Col>
              <Col span={6}>
                <div
                  className="cropper-preview"
                  style={{ width: 240, height: 240, overflow: 'hidden' }}
                />
              </Col>
              <Col span={4}>
                <div
                  className="cropper-preview"
                  style={{ width: 120, height: 120, overflow: 'hidden' }}
                />
              </Col>

              <Col span={4}>
                <div
                  className="cropper-preview"
                  style={{ width: 48, height: 48, overflow: 'hidden' }}
                />
              </Col>
            </Row>
          </Modal>
        ) : null}

        <Upload {...uploadProps} style={{ backgroundColor: 'white' }}>
          {fileList.length > 0 ? null : uploadButton}
        </Upload>
      </div>
    );
  }
}