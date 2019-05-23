import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, message } from 'antd';
import { reduxMapper } from 'src/redux/modules/diskTrouble';
import { ContainerBody } from 'src/components/LittleComponents';
import UntreatedDisk from './listComps/UntreatedDisk';
import UntreatedTask from './listComps/UntreatedTask';
import DiskUninstall from './listComps/DiskUninstall';
import DiskConverter from './listComps/DiskConverter';
import DiskLoading from './listComps/DiskLoading';
import DiskBalance from './listComps/DiskBalance';
import DiskFinish from './listComps/DiskFinish';
import api from "src/tools/api";
import { computedStyle, getStyleNumber } from "src/tools/utils";
import 'src/assets/css/diskDroubleList.scss';


const TabPane = Tabs.TabPane;

class ListManage extends Component {

    state = {
        leftActiveKey: '',
        statistics: [], // 三个指标数据
    };

    static childContextTypes = {
        statistics: PropTypes.array,
        Statistics: PropTypes.func,
        unInstallList: PropTypes.array,
    };

    getChildContext() {
        return {
            statistics: this.state.statistics,
            Statistics: Statistics,
        }
    }

    topPanes = [
        {
            key: 'tab1',
            title: '待处理磁盘 ',
            content: <UntreatedDisk/>,
        },
        {
            key: 'tab2',
            title: '未完成任务 ',
            content: <UntreatedTask/>,
        },
    ];

    leftPanes = [
        {
            key: 'tab1',
            title: '卸载',
            content: <DiskUninstall/>,
        },
        {
            key: 'tab2',
            title: '换盘',
            content: <DiskConverter/>,
        },
        {
            key: 'tab3',
            title: '加载',
            content: <DiskLoading/>,
        },
        {
            key: 'tab4',
            title: '重平衡',
            content: <DiskBalance/>,
        },
        {
            key: 'tab5',
            title: '完成',
            content: <DiskFinish/>,
        },
    ];

    componentDidMount() {
        this.mouseEvent();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const dragContent = document.getElementById('dragContent');
        if (nextProps.isExpendContent && nextProps.isExpendContent !== this.props.isExpendContent) {
            if (!dragContent) return;
            dragContent.style.top = '200px';
            dragContent.style.transition = 'top 0.5s';
            setTimeout(() => {
                dragContent.style.transition = null;
            }, 1000);
        }

        if (nextProps.taskId !== this.props.taskId) {
            this.connectWebsocket(() => {
                this.websocket.send(JSON.stringify({taskId: nextProps.taskId}));
            });
            this.getTaskStatusMsg(nextProps.taskId);
        }
    }

    componentWillUnmount() {
        this.websocket && this.websocket.close();
    }

    // 第二个Tabs
    leftPaneTitle = (pane, index) => {
        const status = this.props.stepStatus[index] || {};
        return <div className="vertical-pane-title">
            <span className={ `icon_${ index + 1 }` }/>
            <span className="title">{ pane.title }</span>
            {
                [2, 3].includes(index) && status.undone ?
                    < span className="disk-status-waiting"><span>{ status.undone }</span></span>
                    : null
            }
            {
                [0, 2, 3].includes(index) && status.fail ?
                    <span className="disk-status-failed"><span>{ status.fail }</span></span>
                    : null
            }
        </div>
    };

    // 拖动
    mouseEvent = () => {
        const parent = document.getElementById('dragContent');
        const header = document.getElementById('dragHeader');

        //判断鼠标是否按下
        let isDown = false;
        //实时监听鼠标位置
        let currentY = 0;
        //记录鼠标按下瞬间的位置
        let originY = 0;
        //鼠标按下时移动的偏移量
        let offsetY = 0;

        const moving = (e) => {
            e = e ? e : window.event;
            e.cancelBubble = true;
            e.stopPropagation();
            if (isDown) {
                currentY = e.clientY;
                offsetY = currentY - originY;   //计算鼠标移动偏移量
                const elY = getStyleNumber(computedStyle(parent).top);
                const resY = elY + offsetY;
                parent.style.top = resY + 'px';
                originY = currentY;
            }
        };
        const start = (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
            isDown = true;
            originY = e.clientY;
        };
        const end = (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
            isDown = false;
            offsetY = 0;
            this.props.changeIsExpendContent(false);
        };
        // 鼠标按下方块
        header.addEventListener("touchstart", start);
        header.addEventListener("mousedown", start);
        // 拖动
        window.addEventListener("touchmove", moving);
        window.addEventListener("mousemove", moving);
        // 鼠标松开
        window.addEventListener("touchend", end);
        window.addEventListener("mouseup", end);
    };


    connectWebsocket = (callback) => {
        // const wsUri = `ws://${ window.location.host }/cdhnm/diskFailureRecovery/websocket`;
        // const wsUri = `ws://172.168.201.40:9999/cdhnm/diskFailureRecovery/websocket`;

        if (!this.websocket) {
            this.websocket = new WebSocket(api.wsUrl, `WS-DATAE-TOKEN.${ localStorage.getItem('token') }`);
        }
        this.websocket.onopen = (evt) => {
            console.log('onopen', evt);
            // this.props.setWebsocket(this.websocket);
            callback();
            setInterval(() => this.websocket.send('HeartBeat'), 5000);
        };
        this.websocket.onclose = (evt) => {
            console.log('onclose', evt);
        };
        this.websocket.onmessage = (evt) => {
            console.log('onmessage', evt);
        };
        this.websocket.onerror = (evt) => {
            console.log('onerror', evt);
        };

    };


    getTaskStatusMsg = (taskId) => {
        api.getTaskStatusMsg({taskId: taskId}).then(res => {
            if (res.data.success !== 'true') {
                message.error(res.data.msg);
                return;
            }
            const data = res.data.data;
            this.props.changeLeftTab('tab' + data.nowLatestProcess);
            this.props.changeStepStatus([
                data.unloadStatusMsg,
                data.changeStatusMsg,
                data.loadStatusMsg,
                data.rebalanceStatusMsg,
                data.finishStatusMsg,
            ]);
        })
    };


    render() {
        const props = this.props;
        return (
            <ContainerBody style={ {height: '100%', position: 'relative'} }>
                <div className="drag-container">
                    <Tabs
                        className="sd-tabs"
                        activeKey={ props.activeTopTab }
                        onChange={ this.props['changeTopTab'] }
                        onEdit={ this.onEdit }
                    >
                        {
                            this.topPanes.map((pane) =>
                                <TabPane key={ pane.key }
                                         tab={ pane.title }
                                >
                                    { props.activeTopTab === pane.key ? pane.content : null }
                                </TabPane>)
                        }
                    </Tabs>
                    <div className="drag-content" id="dragContent">
                        <div className="drag-header" id="dragHeader">
                            <img alt="pic" src={ require('src/assets/images/move_bar.png') }/>
                        </div>
                        <div className="drag-body">
                            <Tabs
                                tabPosition="left"
                                className="disk-list-vertical-tabs"
                                activeKey={ props.activeLeftTab }
                                onChange={ this.props['changeLeftTab'] }
                                onEdit={ this.onEdit }
                            >
                                {
                                    this.leftPanes.map((pane, i) =>
                                        <TabPane
                                            key={ pane.key }
                                            tab={ this.leftPaneTitle(pane, i) }
                                            disabled={ this.props.taskId < 0 }
                                        > { props.activeLeftTab === pane.key ? pane.content : null }</TabPane>)
                                }
                            </Tabs>
                        </div>
                    </div>
                </div>
            </ContainerBody>
        )
    }
}

export default reduxMapper(ListManage);


class Statistics extends React.Component {
    state = {
        statistics: [],
    }
    staticStatistics = [
        {
            title: '待处理磁盘',
            value: 20,
            unit: '个'
        },
        {
            title: '磁盘换盘中',
            value: 20,
            unit: '个'
        },
        {
            title: '数据重平衡中',
            value: 20,
            unit: '个'
        },

    ];

    componentDidMount() {
        this.getCDHIndex();
    }

    getCDHIndex = () => {
        api.getCDHIndex().then(res => {
            if (res.data.success !== 'true') {
                this.setState({
                    msg: res.data.msg,
                });
                return;
            }
            const data = res.data.data;
            this.setState({statistics: [data.unhandleDiskNum, data.changingDiskNum, data.balancingDiskNum]});
        })
    };

    render() {
        return <div className="statistics">
            {
                this.staticStatistics.map((d, i) => {
                    return (
                        <span className="block" key={ i }>
                        <img alt='pic' src={ require(`src/assets/images/icon_disk_status_${ i + 1 }.png`) }/>
                        <span>{ d.title }</span>
                        <span>{ this.state.statistics[i] }</span>
                        <span className="unit">{ d.unit }</span>
                    </span>
                    )
                })
            }

        </div>

    }
}

Statistics.contextTypes = {
    statistics: PropTypes.array
};


