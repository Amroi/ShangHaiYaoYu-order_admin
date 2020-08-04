import { observable, action } from 'mobx';
import ajax from '../util/api/ajax';
import { stringify } from 'qs';
import { message } from 'antd';

class ProductPackageStore {
    @observable page = 1;
    @observable page_size = 10;
    @observable total = 0;
    @observable editorVisible = false;
    @observable addProductVisible = false;
    @observable loading = false;

    dataList = null;
    selectRowData = null;

    changeEditorVisible = (data) => {
        this.editorVisible = !this.editorVisible
        this.selectRowData = data
    }
    changeAddProductVisible = () => {
        this.addProductVisible = !this.addProductVisible
    }
}

export default ProductPackageStore;