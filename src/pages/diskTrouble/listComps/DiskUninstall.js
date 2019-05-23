import React, { Fragment } from "react";
import { Button, Input, message, Divider } from "antd";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import SDTable from "src/components/SDTable";
import SDModal from "src/components/SDModal";
import { ArrowButton } from "src/components/LittleComponents";
import api from 'src/tools/api';
import { debounce } from "src/tools/utils";

const stepStatus = {0: '未处理', 1: '卸载中', 2: '卸载失败', 3: '卸载成功'};
const stepStatusColor = {0: '#cccccc', 1: '#2AA0FF', 2: '#FF4750', 3: '#0ABC51'};

class DiskUninstall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            detailVisible: false,
            detailInfo: null,
            dataSource: [],
            // listSource:[],
            display: false,
        };
    }

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
            render: (status) => {
                const color = status === undefined ? stepStatusColor[0] : stepStatusColor[status];
                const text = status === undefined ? stepStatus[0] : stepStatus[status];
                return <span style={ {color: color} }>{ text }</span>;
            },
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

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.taskId === -1) {
            this.setState({
                dataSource: nextProps.unInstallList,
                selectedRowKeys: nextProps.unInstallList.map(d => d.id)
            });
        }


        if (nextProps.taskId !== this.props.taskId) {
            this.getList(nextProps.taskId);
        }
    }

    // 获取表格数据
    getList = (taskId) => {
        this.setState({tableLoading: true});
        if (!taskId && !this.props.taskId) return;
        api.getRecoveringDiskMsgInUnloadStep({
            taskId: taskId || this.props.taskId,
        }).then(res => {
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
        // console.log(this.state.selectedRowKeys)
    };

    // "详情"
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

    // "卸载"按钮
    uninstall = async () => {
        const logIds = this.state.dataSource.map(item => item.id);

        const taskId = await api.createTask({logIds: logIds}).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            console.log('create task', res);
            return res.data.data;
        });
        console.log(taskId);
        await api.completeUnloadDisks({logIds: logIds, taskId: taskId}).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeTaskId(res.data.data);  // 设置taskId
            // this.getList(res.data.data); // 刷新表格内容
        });
    };

    // 下一步
    nextStep = () => {
        const isStatusOK = this.state.dataSource.find(d => d.status <= 3);
        if (isStatusOK) {
            message.error('请选择成功卸载的磁盘');
            return;
        }
        api.confirmUnloadedDisk({logIds: this.state.selectedRowKeys, taskId: this.props.taskId}).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeTopTab('tab2'); // top tabs
            this.props.changeLeftTab('tab2'); // left tabs
            this.props.changeUninstallList([]); // 清空数据
        });
    };

    render() {
        const props = this.props;
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
                            onChange={ this.onSearchChange }
                        />
                        <Button
                            htmlType="button"
                            type="primary"
                            className="sd-grey"
                            disabled={ !props.taskId }
                            style={ {marginRight: '8px'} }
                            onClick={ this.uninstall }
                        >
                            重试
                        </Button>
                        <Button
                            htmlType="button"
                            type="primary"
                            className="sd-minor"
                            style={ {marginRight: '8px'} }
                            onClick={ this.uninstall }
                        >
                            卸载
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
                    rowSelection={ {
                        selectedRowKeys: this.state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    columnsProportion={ [2, 3, 1, 4] }
                />
                <div style={ {float: 'right', marginTop: '18px'} }>
                    <ArrowButton type="next" onClick={ this.nextStep } disabled={ state.display }>下一步</ArrowButton>
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
                onCancel={ () => this.setState({detailVisible: false}) }
                style={ {width: '426px'} }
            >
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

export default reduxMapper(DiskUninstall);