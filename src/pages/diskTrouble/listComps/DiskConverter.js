import React, { Fragment } from "react";
import { Button, Input, message } from "antd";
import SDTable from "src/components/SDTable";
import { ArrowButton } from "src/components/LittleComponents";
import { reduxMapper } from "src/redux/modules/diskTrouble";
import api from 'src/tools/api';
import { debounce } from "../../../tools/utils";

const stepStatus = {
    4: '等待换盘', 5: '换盘中', 6: '换盘失败', 7: '换盘成功'
};

class DiskConverter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            dataSource: [],
            tableLoading: false,
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
            title: '换盘进度',
            dataIndex: 'status',
            render: (status) => stepStatus[status],
        },
    ];

    componentDidMount() {
        this.getList();
    }

    getList = (taskId) => {
        this.setState({tableLoading: true});
        api.getRecoveringDiskMsgInChangeStep({
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
    };

    // 确认换盘成功按钮
    convert = () => {
        api.completeChangeDisk({
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
        const isStatusOK = this.state.dataSource.find(d => d.status !== 7);
        if (isStatusOK) {
            message.error('请选择成功换盘的磁盘');
            return;
        }
        api.confirmChangedDisk({logIds: this.state.selectedRowKeys, taskId: this.props.taskId}).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            this.props.changeLeftTab('tab3'); // left tabs
        });
    };
    //上一步
    upStep = () => {
        this.props.changeLeftTab('tab1');
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


    render() {
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
                            style={ {marginRight: '8px'} }
                            onClick={ this.exportFile }
                        >
                            导出
                        </Button>
                        <Button htmlType="button"
                                type="primary"
                                className="sd-minor"
                                style={ {marginRight: '8px'} }
                                onClick={ this.convert }
                        >
                            确认换盘成功
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
                    <ArrowButton type="last" onClick={ this.upStep }>上一步</ArrowButton>
                    <ArrowButton type="next" onClick={ this.nextStep }>下一步</ArrowButton>
                </div>
            </div>
        </Fragment>
    }
}

export default reduxMapper(DiskConverter);