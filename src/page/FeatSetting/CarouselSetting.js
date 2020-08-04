import React from 'react';
import { DownCircleOutlined, UpCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Carousel, message, Card, Row, Col, Table, Button } from 'antd';
import ajax from '../../util/api/ajax';
import { SingleImageUpload } from '../../component/O2O/ZksoftUpload';

class CarouselSetting extends React.Component {
    componentDidMount() {
        this.fetachImages();
    };

    fetachImages = async () => {
        const resp = await ajax({ url: `/erp/o2o//carousel/list` });
        if (resp && resp.success) {
            this.setState({
                imageList: resp.data,
            })
        } else {
            message.warn('查询数据失败，请刷新重试')
        }
    }

    state = {
        imageList: [],
        removeList: [],
        loading: false,
    };

    changePicPosition = (row, val) => {
        const { imageList } = this.state;
        let neiRow;
        for (let i in imageList) {
            if (imageList[i].order_num === row.order_num + val) {
                neiRow = imageList[i];
                break;
            }
        }
        if (!neiRow) {
            message.warn('调整错误，请重新尝试');
            return;
        }
        
        row.order_num += val;
        neiRow.order_num -= val;
        imageList.sort(function(a, b) {
            return a.order_num - b.order_num;
        })
        this.setState({
            imageList: imageList,
        })
    };

    setLoading = (val) => {
         this.setState({
             loading: val,
         })
    }

    handleSave = async () => {
        const { imageList, removeList } = this.state;
        for(let i in imageList) {
            if (!imageList[i].pic_url) {
                message.warn('请先删除没有图片的行');
                return;
            }
        };
        try {
            this.setLoading(true);
            const params = {};
            params.update_list = imageList;
            params.remove_list = removeList;
            const resp = await ajax({url: '/erp/o2o/carousel/update', method: 'POST', data: params});
            if (resp) {
                if (resp.success) {
                    message.success(resp.msg);
                } else {
                    message.warn(resp.msg);
                }
            }
        } finally {
            this.setLoading(false);
        }
    }

    handleAddPic = () => {
        let { imageList } = this.state;
        if (imageList.length > 3) {
            message.warn('图片只能设置四张');
            return;
        };
        let newRow = {
            id: new Date().getTime().toString(),
            pic_url: '',
            order_num: imageList.length + 1,
            is_new: true,
        };
        imageList = imageList.concat(newRow);
        this.setState({
            imageList: imageList,
        });
    }

    handleRemove = (row) => {
        let { imageList, removeList } = this.state;
        this.setLoading(true);
        for (let i in imageList) {
            if (imageList[i].order_num > row.order_num) {
                imageList[i].order_num -= 1;
            }
        };
        imageList.forEach((item, idx) => {
            if (item.id === row.id) {
                removeList = removeList.concat(item.id);
                imageList.splice(idx, 1);
                return;
            }
        });
        this.setState({
            imageList: imageList,
            removeList: removeList,
            loading: false,
        });
    }

    columns = [
        {
            title: '图片',
            dataIndex: 'pic_url',
            width: '60%',
            render: (val, record) => <SingleImageUpload onChange={(val) => {
                // record.pic_url = val;
                const imageList = this.state.imageList;
                for(let idx in imageList) {
                    if (imageList[idx].id === record.id) {
                        imageList[idx].pic_url = val;
                        break;
                    }
                }
                this.setState({imageList: imageList});
            }} long value={val} />
        },
        {
            title: '当前顺序',
            align: 'center',
            width: '16%',
            dataIndex: 'order_num',
            // sort: (a, b) => a.order_num - b.order_num,
        },
        {
            title: '操作',
            align: 'center',
            render: (_, record) => <span><a title='上移' onClick={() => this.changePicPosition(record, -1)} disabled={record.order_num === 1}><UpCircleOutlined style={{fontSize: 18}} /></a>
            <a onClick={() => this.changePicPosition(record, 1)} disabled={record.order_num >= this.state.imageList.length} title='下移'><DownCircleOutlined style={{fontSize: 18, marginLeft: 10}} /></a>
            <a title='删除' onClick={() => this.handleRemove(record)}>
                 <DeleteOutlined style={{fontSize: 18, marginLeft: 10}} />
                {/* <Icon type="delete" style={{fontSize: 18, marginLeft: 10}} /> */}
                </a></span>
        }
    ]

    render() {
        const { imageList, loading } = this.state;
        const subEle = imageList.map(item => {
            return <div align='center'>
                <img src={item.pic_url} style={{ maxHeight: 180 }} />
            </div>
        })
        return <div>
            <Card title='轮播图设置'>
                <div style={{marginBottom: 10}}>
                <Button onClick={this.handleAddPic}>新增</Button>
                <Button style={{ marginLeft: 20 }} type='primary' onClick={this.handleSave}>保存</Button>
                </div>
                <Row gutter={24}>
                    <Col span={12}>
                        <Table
                            rowKey='id'
                            size='small'
                            loading={loading}
                            pagination={false}
                            columns = {this.columns} 
                            dataSource = {this.state.imageList} />
                    </Col>
                    <Col span={12}>
                    <Card title='预览' size='small'>
                    <Carousel autoplay>{subEle}</Carousel>
                    </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    }
}

export default CarouselSetting;