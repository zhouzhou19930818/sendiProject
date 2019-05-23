import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import { Input, message } from "antd";
import moment from "moment";
import api from 'src/tools/api';
import SDTable from "src/components/SDTable";
import { computeHeight, debounce } from "src/tools/utils";

import { reduxMapper } from "src/redux/modules/diskTrouble";


class UntreatedDisk extends React.Component {

    static contextTypes = {
        Statistics: PropTypes.func,
    };

    state = {
        dataSource: [],
        selectedRowKeys: [],
        tableLoading: true,
        scrollY: undefined,
    };

    columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
        }, {
            title: 'IP地址',
            dataIndex: 'ip',
            key: 'ip',
        }, {
            title: '磁盘路径',
            dataIndex: 'directory',
            key: 'directory',
        }, {
            title: '产生时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },];

    componentDidMount() {
        this.getList();
        this.setScrollY();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.taskId !== this.props.taskId) {
            this.getList();
        }
    }


    getList = () => {
        if (!this.state.tableLoading) this.setState({tableLoading: true});
        api.getUntreatedDiskList().then(res => {
            if (res.data.success !== 'true') {
                this.setState({tableLoading: false});
                message.error(res.data.msg);
                return;
            }
            const responseData = res.data.data;
            this.setState({
                tableLoading: false,
                dataSource: responseData && responseData.map((d, i) => ({...d, index: i + 1})),
                selectedRowKeys: this.props.unInstallList.reduce((res, data) => {
                    const obj = responseData.find(d => d.id === data.id);
                    obj && res.push(obj.id);
                    return res;
                }, []),
            });
        });
    };

    setScrollY = () => {
        const compute = computeHeight([[568, 606, 805], [105, 120, 100, 64]]);
        let scrollY = undefined;
        if (compute) {
            const contentPadding = 16;
            const contentTabs = 61;
            const contentTablePagination = 44;
            // const contentTableHead = 64; // 当表格内容占两行时的高度, 43: 一行的高度
            const containerHeight = compute.height;
            const contentTableHead = compute.candidateHeight;
            const filterFormEL = document.getElementById('filterForm');
            let contentFilterForm = 45;
            if (filterFormEL) contentFilterForm = filterFormEL.clientHeight + 5;
            scrollY = containerHeight - contentPadding - contentTabs - contentFilterForm - contentTablePagination - contentTableHead;
        }
        this.setState({scrollY});
    };

    onRowSelect = (selectedRowKeys, objList) => {
        this.setState({selectedRowKeys}, () => {
            this.props.changeUninstallList(objList);
            debounce(() => this.props.changeIsExpendContent(true), 1200);
        });
    };

    render() {
        const state = this.state;
        const Statistics = this.context.Statistics;
        return (
            <Fragment>
                <div className="pending" id="filterForm">
                    <Statistics/>
                    <Input.Search
                        placeholder="请输入关键字"
                        style={ {float: 'right', marginTop: '5px', width: '230px', marginRight: '12px'} }/>
                </div>
                <SDTable
                    rowKey="id"
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    rowSelection={ {
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    scroll={ {y: 200} }
                    columnsProportion={ [1, 2, 4, 2] }
                />
            </Fragment>
        )
    }
}

export default reduxMapper(UntreatedDisk);