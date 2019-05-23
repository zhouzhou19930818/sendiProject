import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import { Input, message, Progress, Button } from "antd";
import api from 'src/tools/api';
import SDTable from "src/components/SDTable";
import moment from "moment";
import { reduxMapper } from "src/redux/modules/diskTrouble";

class UntreatedTask extends React.Component {
    state = {
        dataSource: [],
        statistics: [],
        tableLoading: true,
        percent: 0,
    };

    static contextTypes = {
        Statistics: PropTypes.func,
    };

    columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
        }, {
            title: '任务名称',
            dataIndex: 'taskName',
            key: 'taskName',
        }, {
            title: '开始时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        }, {
            title: '最后状态',
            dataIndex: 'nowLatestProcess',
            key: 'nowLatestProcess',
        }, {
            title: '处理进度',
            dataIndex: 'currentTaskPoint/totalTaskPoint',
            key: 'currentTaskPoint/totalTaskPoint',
            render(record) {
                const ButtonGroup = Button.Group;
                // (record.currentTaskPoint)/(record.totalTaskPoint)
                return (
                <Fragment>
                        <Progress percent={this.state.percent} />
                        <ButtonGroup>
                        </ButtonGroup>
                </Fragment>
                );
              }
        },{
            title: '操作',
            dataIndex: 'op',
            key: 'op',
            render: (record, taskObj) => {
                // console.log(taskObj.id)
                return <button className="sd-anchor-button" onClick={ () => this.continueStep(taskObj) }>继续操作</button>
            }
        },];

    componentDidMount() {
        this.getList();
    }

    increase = () => {
        let percent = this.state.percent + 10;
        if (percent > 100) {
          percent = 100;
        }
        this.setState({ percent });
      };

    decline = () => {
        let percent = this.state.percent - 10;
        if (percent < 0) {
          percent = 0;
        }
        this.setState({ percent });
      };

    getList = () => {
        if (!this.state.tableLoading) this.setState({tableLoading: true});
        // console.log(999)
        api.getUnfinishedTaskList().then(res => {
            if (res.data.success !== 'true') {
                this.setState({tableLoading: false});
                message.error(res.data.msg);
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data && res.data.data.map((d, i) => ({...d, index: i + 1})),
            });
        });
    };

    continueStep = (taskObj) => {
        console.log(taskObj);
        this.props.changeUninstallList([]);
        this.props.changeTaskId(taskObj.id);
        this.props.changeLeftTab('tab1');
        this.props.changeIsExpendContent(true);
    };

    render() {
        const state = this.state;
        const Statistics = this.context.Statistics;
        const ButtonGroup = Button.Group;
        return (
            <Fragment>
                <div className="pending">
                    <Statistics/>
                    <Input.Search
                        placeholder="请输入关键字"
                        style={ {float: 'right', marginTop: '5px', width: '230px', marginRight: '12px'} }/>
                </div>
                <SDTable
                    rowKey="id"
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    scroll={ {y: 200} }
                    columnsProportion={ [1, 3, 3, 2] }
                />
            </Fragment>
        )
    }
}

export default reduxMapper(UntreatedTask);