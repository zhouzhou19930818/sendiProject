import React, { Fragment } from "react";
import { Button, Divider, Input, message } from "antd";
import SDTable from "src/components/SDTable";
import SDModal from "src/components/SDModal";
import { ArrowButton } from "src/components/LittleComponents";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import api from "../../../tools/api";
import { debounce } from "../../../tools/utils";

const stepStatus = {
    8: '未加载', 9: '加载中', 10: '加载失败', 11: '加载成功'
};

class DiskLoading extends React.Component {
    state = {
        selectedRowKeys: [],
        detailVisible: false,
        detailInfo: null,
        dataSource: [],
        tableLoading: false,
    };
    columns = [
        {
            title: 'IP地址',
            dataIndex: 'ip',
            width: '15%',
        },
        {
            title: '磁盘路径',
            dataIndex: 'directory',
            width: '30%',
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: (status) => stepStatus[status],
        },
        {
            title: '操作',
            dataIndex: 'op',
            render: (d, record) => {
                return (
                    <Fragment>
                        <button
                            key="btn_1"
                            className="sd-anchor-button"
                            style={ {color: '#0E6EDF'} }
                            onClick={ () => this.onDetailShow(record) }
                        >
                            详情
                        </button>
                        {
                            record.status === 2 ? (
                                <Fragment>
                                    <Divider type="vertical"/>
                                    <button
                                        key="btn_2"
                                        className="sd-anchor-button"
                                        style={ {color: '#0E6EDF'} }
                                        onClick={ () => this.onDetailShow(record) }
                                    >
                                        人工修复
                                    </button>
                                </Fragment>
                            ) : null
                        }
                    </Fragment>
                )
            }
        },
    ];

    componentDidMount() {
        this.getList();
    }

    getList = () => {
        this.setState({tableLoading: true});
        api.getRecoveringDiskMsgInLoadStep({taskId: this.props.taskId}).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                this.setState({tableLoading: false});
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data,
                selectedRowKeys: res.data.data.map(d => d.id),
            });
        })
    };

    onRowSelect = (selectedRowKeys) => {
        this.setState({selectedRowKeys});
    };

    onDetailShow = (record) => {
        this.setState({detailVisible: true, detailInfo: record});
    };

    // 模糊查询
    onSearchChange = (e) => {
        this.setState({tableLoading: true});
        const fn = (value) => () => {
            // todo: 模糊查询接口
            api.getModelByNameOrDesc(value).then((res) => {
                this.setState({
                    dataSource: res.data.data && res.data.data.map((d, i) => ({...d, index: i + 1})),
                    tableLoading: false,
                })
            })
        };
        debounce(fn(e.target.value));
    };

    load = () => {
        api.completeLoadDisk({
            logIds: this.state.dataSource.map(item => item.id),
            taskId: this.props.taskId
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.getList(); // 刷新表格内容
        });
    };

    // 下一步
    nextStep = () => {
        const isStatusOK = this.state.dataSource.find(d => d.status <= 11);
        if (isStatusOK) {
            message.error('请选择成功加载的磁盘');
            return;
        }
        api.confirmLoadedDisk({
            logIds: this.state.dataSource.map(item => item.id),
            taskId: this.props.taskId
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeLeftTab('tab4'); // left tabs
        });
    };


    render() {
        const state = this.state;
        return <Fragment>
            <div className="top-part">
                <div className="sd-filter-form">
                    <span className="icon-wrapper top"/>
                    <span className="title">修复列表</span>
                    <div style={ {float: 'right'} }>
                        <Input.Search
                            placeholder="请输入关键字"
                            style={ {width: '230px', marginRight: '18px'} }
                            onChange={ this.onSearchChange }/>
                        <Button
                            htmlType="button"
                            type="primary"
                            className="sd-minor"
                            style={ {marginRight: '8px'} }
                            onClick={ this.load }
                        >
                            加载
                        </Button>
                    </div>
                </div>
                <SDTable
                    rowKey="id"
                    className="sd-table-simple tr-color-interval"
                    style={ {boxShadow: '0px 1px 5px 0px rgba(187,194,205,0.3)'} }
                    columns={ this.columns }
                    dataSource={ this.state.dataSource }
                    pagination={ false }
                    loading={ this.state.tableLoading }
                    rowSelection={ {
                        selectedRowKeys: this.state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                />
                <div style={ {float: 'right', marginTop: '18px'} }>
                    <ArrowButton type="last" onClick={ () => this.props.changeLeftTab('tab2') }>上一步</ArrowButton>
                    <ArrowButton type="next" onClick={ this.nextStep }>下一步</ArrowButton>
                </div>
            </div>
            <div className="bottom-part">
                <div className="sd-filter-form">
                    <span className="icon-wrapper bottom"/>
                    <span className="title">控制台</span>
                </div>
                <div className="console">
                    {
                        state.dataSource.reduce((res, data) => {
                            if (state.selectedRowKeys.includes(data.id)) {
                                res.push(
                                    <div key={ data.id } className="block">
                                        <div className="block_left">
                                            <div className="wrapper">
                                                <span className="icon_ip"/>
                                                { data.ip }
                                                <span className="status blue">{ data.status }</span>
                                            </div>
                                            <div className="wrapper">
                                                <span className="icon_url"/>
                                                { data.url }
                                            </div>
                                        </div>
                                        <div className="block_right">
                                            { data.console }
                                        </div>
                                    </div>
                                );
                            }
                            return res;
                        }, [])
                    }
                </div>
            </div>
            <SDModal
                title="磁盘修复详情"
                visible={ state.detailVisible }
                onCancel={ () => this.setState({detailVisible: false}) }>
                {
                    state.detailInfo ? (
                        <Fragment>
                            <div className="detail_top" style={ {padding: '8px 6px', marginBottom: '10px'} }>
                                <div className="wrapper">
                                    <span className="icon_ip"/>
                                    { state.detailInfo.ip }
                                    <span className="status blue">{ state.detailInfo.status }</span>
                                </div>
                                <div className="wrapper">
                                    <span className="icon_url"/>
                                    { state.detailInfo.url }
                                </div>
                            </div>
                            < div className="detail_bottom">
                                { state.detailInfo.console }
                            </div>
                        </Fragment>
                    ) : null
                }
            </SDModal>
        </Fragment>
    }
}


export default reduxMapper(DiskLoading);