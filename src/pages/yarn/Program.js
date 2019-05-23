import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Button, DatePicker, Card, Radio, message, Input } from "antd";
import moment from 'moment';
import update from 'immutability-helper';
import api from 'src/tools/api';
import { memoryTrendOption, memoryTopNTrendOption, getSeries } from './allChartsOptions';
import SDTable from 'src/components/SDTable';

import Block from './Block';
import { downloadFile } from "src/tools/utils";

const {Item: FormItem} = Form;

const interval = ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天'];


export default class Program extends Component {
    state = {
        timeType: 3,
        historyTimeType: 3,
        programHistorySource: [],
        runningTime: 180,
        memoryTrend: {
            chartOption: memoryTrendOption, // 内存总体趋势
            loading: true,
            interval: '',
        },
        memoryTopNTrend: {
            chartOption: memoryTopNTrendOption, // 内存TopN趋势
            loading: true,
            interval: '',
            pageIndex: 1,
        },
        memoryTopNDetail: {  // 各程序内存详情
            dataSource: [],
            loading: true,
        },
        memoryTotalSpace: {
            memory: '',
            disk: '',
        },
        cpuTrend: {
            chartOption: memoryTrendOption, // 内存总体趋势
            loading: true,
            interval: '',
        },
        cpuTopNTrend: {
            chartOption: memoryTopNTrendOption, // 内存TopN趋势
            loading: true,
            interval: '',
            pageIndex: 1,
        },
        cpuTopNDetail: {  // 各程序内存详情
            dataSource: [],
            loading: true,
        },
        cpuTotalSpace: {
            memory: '',
            disk: '',
        },
        historyTable: {
            dataSource: [],
            loading: true,
            pagination: {
                current: 1,
                pageSize: 2,
                total: 0
            },
            onChange: (pagination, filters, sorter) => {
                console.log(pagination, filters, sorter);
                if (pagination && pagination.current) {
                    this.setState(update(this.state.historyTable, {
                        pagination: {$set: pagination},
                    }), () => {
                        this.getProgramHistoryDetail();
                    })
                }
            }
        },
        overRunningTimeTable: {
            dataSource: [],
            loading: true,
            pagination: {
                current: 1,
                total: 0
            }
        }

    };

    memoryTopNSeries; // 内存 TopN series 数据
    cpuTopNSeries; // cpu TopN series 数据
    memoryDetail; // 内存应用详情需要导出的数据
    cpuDetail; // cpu详情需要导出的数据

    startTime1 = moment().subtract(24, "hours").format('YYYY-MM-DD HH:mm:ss');
    endTime1 = moment().format('YYYY-MM-DD HH:mm:ss');
    startTime2 = ''; // 被联动开始时间
    endTime2 = ''; // 被联动结束时间
    startTime3 = moment().subtract(24, "hours").format('YYYY-MM-DD HH:mm:ss'); // 程序历史开始时间
    endTime3 = moment().format('YYYY-MM-DD HH:mm:ss'); // 程序历史结束时间
    customStartTime = ''; // 自定义开始时间
    customEndTime = ''; // 自定义结束时间
    // 内存应用详情表格columns
    memoryTrendDataSource = []; // 内存趋势图数据
    cpuTrendDataSource = []; // cpu趋势图数据

    memoryTopNColumns = [
        {
            title: '程序ID',
            dataIndex: 'programId',
            width: 180,
        },
        {
            title: '程序名称',
            dataIndex: 'programName',
            width: 180,
        },
        {
            title: '程序类型',
            dataIndex: 'type',
            width: 180,
        },
        {
            title: '最终状态',
            dataIndex: 'state',
            width: 180,
        },
        {
            title: '区间内最大内存',
            dataIndex: 'allocatedMaxMemory',
            width: 180,
        },
        {
            title: '区间内最大CPU',
            dataIndex: 'allocatedMaxVcore',
            width: 180,
        },
        {
            title: '总运行时长(分钟)',
            dataIndex: 'runningTime',
            width: 180,
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 180,
        },
        {
            title: '队列',
            dataIndex: 'pool',
            width: 180,
        },
        {
            title: '租户',
            dataIndex: 'user',
            width: 180,
        },
        {
            title: '应用',
            dataIndex: 'applicationName',
            width: 180,
        },
    ]; // 内存应用详情
    cpuTopNColumns = [
        {
            title: '程序ID',
            dataIndex: 'programId',
            width: 180,
        },
        {
            title: '程序名称',
            dataIndex: 'programName',
            width: 180,
        },
        {
            title: '程序类型',
            dataIndex: 'type',
            width: 180,
        },
        {
            title: '最终状态',
            dataIndex: 'state',
            width: 180,
        },
        {
            title: '区间内最大CPU(个数)',
            dataIndex: 'allocatedMaxVcore',
            width: 180,
        },
        {
            title: '区间内最大内存',
            dataIndex: 'allocatedMaxMemory',
            width: 180,
        },
        {
            title: '总运行时长(分钟)',
            dataIndex: 'runningTime',
            width: 180,
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 180,
        },
        {
            title: '队列',
            dataIndex: 'pool',
            width: 180,
        },
        {
            title: '租户',
            dataIndex: 'user',
            width: 180,
        },
        {
            title: '应用',
            dataIndex: 'applicationName',
            width: 180,
        },
    ]; // cpu应用详情
    historyColumns = [
        {
            title: '程序名称',
            dataIndex: 'programName',
            width: 180,
        },
        {
            title: '程序ID',
            dataIndex: 'programId',
            width: 180,
        },
        {
            title: '程序类型',
            dataIndex: 'type',
            width: 180,
        },
        {
            title: '最终状态',
            dataIndex: 'state',
            width: 180,
        },
        {
            title: '已分配的内存量',
            dataIndex: 'allocatedMemorySeconds',
            width: 180,
        },
        {
            title: '已分配的CPU资源量',
            dataIndex: 'allocatedVcoreSeconds',
            width: 180,
        },
        {
            title: '总运行时长(分钟)',
            dataIndex: 'runningTime',
            width: 180,
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 180,
        },
        {
            title: '所在队列',
            dataIndex: 'pool',
            width: 180,
        },
        {
            title: '租户',
            dataIndex: 'user',
            width: 180,
        },
        {
            title: '所属应用',
            dataIndex: 'applicationName',
            width: 180,
        },
    ];
    overRunningTimeColumns = [
        {
            title: '程序名称',
            dataIndex: 'programName',
            width: 180,
        },
        {
            title: '程序ID',
            dataIndex: 'programId',
            width: 180,
        },
        {
            title: '程序类型',
            dataIndex: 'type',
            width: 180,
        },
        {
            title: '最终状态',
            dataIndex: 'state',
            width: 180,
        },
        {
            title: '已分配的内存量',
            dataIndex: 'allocatedMemorySeconds',
            width: 180,
        },
        {
            title: '已分配的CPU资源量',
            dataIndex: 'allocatedVcoreSeconds',
            width: 180,
        },
        {
            title: '总运行时长(分钟)',
            dataIndex: 'runningTime',
            width: 180,
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 180,
        },
        {
            title: '所在队列',
            dataIndex: 'pool',
            width: 180,
        },
        {
            title: '租户',
            dataIndex: 'user',
            width: 180,
        },
        {
            title: '所属应用',
            dataIndex: 'applicationName',
            width: 180,
        },
    ];

    static contextTypes = {
        clusterValue: PropTypes.string,
    };

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.context.clusterValue !== nextContext.clusterValue) {
            this.getMemoryTrend(nextContext.clusterValue); // 获取内存趋势图数据并加载图表
            this.getCpuTrend(nextContext.clusterValue);
            this.getProgramHistoryDetail(nextContext.clusterValue);
            this.getOverRunningTimeProgram(nextContext.clusterValue);
            this.setState({timeType: 3});
        }
    }

    // 集群内存总体情况
    getMemoryTrend = (cluster, startTime, endTime) => {
        this.setState(update(this.state, {
            memoryTrend: {
                loading: {$set: true},
            },
            memoryTopNTrend: {
                loading: {$set: true},
            },
            memoryTopNDetail: {
                dataSource: {$set: []},
                loading: {$set: true}
            },
        }));
        api.getClusterYarnMemoryInfo({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.startTime1,
            endTime: endTime || this.endTime1,
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取集群内存总体情况失败: ' + res.data.msg);
                this.setState(update(this.state, {
                    memoryTrend: {
                        chartOption: {$set: memoryTrendOption}, // 内存总体趋势
                        loading: {$set: false},
                        interval: {$set: ''},
                    },
                    memoryTopNTrend: {
                        loading: {$set: false},
                        chartOption: {$set: memoryTopNTrendOption},
                        interval: {$set: ''},
                    },
                    memoryTopNDetail: {
                        dataSource: {$set: []},
                        loading: {$set: false}
                    },
                }));
                this.memoryTrendDataSource = [];
                return;
            }
            const data = res.data.data;
            this.memoryTrendDataSource = data.pointDTOS;
            let x = [], y1 = [], y2 = [], y3 = [], y4 = [];
            this.memoryTrendDataSource && this.memoryTrendDataSource.forEach(d => {
                x.push(d.time);
                y1.push(d.memoryRate * 100);
                y2.push(d.diskRate * 100);
                y3.push(d.runningAppCount);
                y4.push(d.acceptedAppCount);
            });

            this.setState({
                memoryTotalSpace: {
                    memory: data.totalMemorySpace,
                    disk: data.totalDiskSpace,
                },
                memoryTrend: {
                    loading: false,
                    interval: interval[data.interval],
                    chartOption: update(this.state.memoryTrend.chartOption, {
                        xAxis: {
                            0: {data: {$set: x}},
                        },
                        yAxis: {
                            2: {
                                max: {$set: 4},
                            }
                        },
                        series: {
                            0: {data: {$set: y3}},
                            1: {data: {$set: y4}},
                            2: {data: {$set: y1}},
                            3: {data: {$set: y2}},
                        },
                        tooltip: {
                            formatter: {
                                $set: (params) => {
                                    if (!params) return;
                                    const index = params[0].dataIndex;
                                    const obj = this.memoryTrendDataSource[index];
                                    if (!obj) return '';
                                    return `时间：${ obj.time }<br/>
                                    内存使用量占比：${ obj.memoryRate * 100 }%<br/>
                                    磁盘使用空间占比：${ obj.diskRate * 100 }%<br/>
                                    程序个数：${ obj.appCount }<br/>
                                    CPU个数：${ obj.cpuUsed }`
                                }
                            }
                        }
                    }),
                    sliderDefaultPosition: {start: 50, end: 100} // 百分比
                },
            });
            const startPosition = 50, endPosition = 100;
            const startIndex = Math.floor(startPosition / 100 * x.length - 1);
            const endIndex = Math.floor(endPosition / 100 * x.length - 1);
            this.getMemoryTopNTrend(cluster, x[startIndex], x[endIndex]);
        });
    };

    // 区间内内存TOPN程序趋势图
    getMemoryTopNTrend = (cluster, startTime, endTime) => {
        this.setState(update(this.state, {
            memoryTopNTrend: {
                loading: {$set: true},
            },
            memoryTopNDetail: {
                loading: {$set: true}
            },
        }));
        const params = {
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.startTime2 || this.startTime1,
            endTime: endTime || this.endTime2 || this.endTime1,
        };
        api.getTopProgramMemory(params).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取区间内内存TOPN程序趋势失败: ' + res.data.msg);
                this.setState({
                    memoryTopNTrend: {
                        loading: false,
                        interval: '',
                        chartOption: memoryTopNTrendOption,
                    },
                    memoryTopNDetail: {
                        dataSource: [],
                        loading: false
                    },
                });

                return;
            }
            this.getMemoryTopNDetail(params);
            const data = res.data.data;
            let x = [], series = [], legend = [];

            data.programInfos.forEach((first, i) => {
                let seriesData = [];
                first.programInfos && first.programInfos.forEach(d => {
                    i === 0 && x.push(d.time);
                    seriesData.push(d.allocatedMemoryGB);
                });
                legend.push(first.programId);
                series.push(getSeries(i, first.programId, seriesData))
            });
            this.memoryTopNSeries = series;
            this.setState({
                memoryTopNTrend: {
                    loading: false,
                    interval: interval[data.interval],
                    chartOption: update(this.state.memoryTopNTrend.chartOption, {
                        legend: {data: {$set: legend}},
                        tooltip: {
                            formatter: {
                                $set: (params) => {
                                    if (!params) return;
                                    const dataIndex = params.dataIndex;
                                    const seriesIndex = params.seriesIndex;
                                    const program = data.programInfos[seriesIndex];
                                    if (!program) return '';
                                    const obj = program.programInfos[dataIndex];
                                    if (!obj) return '';
                                    return `时间：${ obj.time }<br/>
                                    程序ID：${ obj.programId }<br/>
                                    程序名称：${ obj.programName && obj.programName !== 'null' ? obj.programName : '' }<br/>
                                    程序类型：${ obj.type && obj.type !== 'null' ? obj.type : '' }<br/>
                                    内存用量：${ obj.allocatedMemoryGB }GB<br/>
                                    CPU个数：${ obj.allocatedVCores }`
                                }
                            }
                        },
                        xAxis: {
                            0: {data: {$set: x}},
                        },
                        series: {$set: series},
                    }),
                    pageIndex: 1
                },
            });
        });

    };

    // 各程序内存详情
    getMemoryTopNDetail = (params) => {
        api.getTopProgramMemoryDetail(params).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取各程序内存详情失败: ' + res.data.msg);
                this.setState({
                    memoryTopNDetail: {
                        dataSource: [],
                        loading: false
                    }
                });
                return;
            }
            this.memoryDetail = res.data;
            this.setState({
                memoryTopNDetail: {
                    dataSource: res.data.data && res.data.data.map((d, i) => ({...d, index: i + 1})),
                    loading: false
                }
            });
        });

    };

    // 集群内存总体情况
    getCpuTrend = (cluster, startTime, endTime) => {
        this.setState(update(this.state, {
            cpuTrend: {
                loading: {$set: true},
            },
            cpuTopNTrend: {
                loading: {$set: true},
            },
            cpuTopNDetail: {
                dataSource: {$set: []},
                loading: {$set: true}
            },
        }));
        api.getClusterYarnCpuInfo({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.startTime1,
            endTime: endTime || this.endTime1,
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取集群内存总体情况失败: ' + res.data.msg);
                this.setState(update(this.state, {
                    cpuTrend: {
                        chartOption: {$set: memoryTrendOption}, // 内存总体趋势
                        loading: {$set: false},
                        interval: {$set: ''},
                    },
                    cpuTopNTrend: {
                        loading: {$set: false},
                        chartOption: {$set: memoryTopNTrendOption},
                        interval: {$set: ''},
                    },
                    cpuTopNDetail: {
                        dataSource: {$set: []},
                        loading: {$set: false}
                    },
                }));
                this.cpuTrendDataSource = [];
                return;
            }
            const data = res.data.data;
            this.cpuTrendDataSource = data.pointDTOS;
            let x = [], y1 = [], y2 = [], y3 = [], y4 = [];
            this.cpuTrendDataSource && this.cpuTrendDataSource.forEach(d => {
                x.push(d.time);
                y1.push(d.memoryRate * 100);
                y2.push(d.diskRate * 100);
                y3.push(d.runningAppCount);
                y4.push(d.acceptedAppCount);
            });

            this.setState({
                cpuTotalSpace: {
                    cpu: data.totalCpuNum,
                    disk: data.totalDiskSpace,
                },
                cpuTrend: {
                    loading: false,
                    interval: interval[data.interval],
                    chartOption: update(this.state.memoryTrend.chartOption, {
                        xAxis: {
                            0: {data: {$set: x}},
                        },
                        yAxis: {
                            2: {
                                max: {$set: 4},
                            }
                        },
                        series: {
                            0: {data: {$set: y3}},
                            1: {data: {$set: y4}},
                            2: {data: {$set: y1}},
                            3: {data: {$set: y2}},
                        },
                        tooltip: {
                            formatter: {
                                $set: (params) => {
                                    if (!params) return;
                                    const index = params[0].dataIndex;
                                    const obj = this.cpuTrendDataSource[index];
                                    if (!obj) return '';
                                    return `时间：${ obj.time }<br/>
                                    内存使用量占比：${ obj.memoryRate * 100 }%<br/>
                                    磁盘使用空间占比：${ obj.diskRate * 100 }%<br/>
                                    程序个数：${ obj.appCount }<br/>
                                    CPU个数：${ obj.cpuUsed }`
                                }
                            }
                        }
                    }),
                    sliderDefaultPosition: {start: 50, end: 100} // 百分比
                },
            });
            const startPosition = 50, endPosition = 100;
            const startIndex = Math.floor(startPosition / 100 * x.length - 1);
            const endIndex = Math.floor(endPosition / 100 * x.length - 1);
            this.getCpuTopNTrend(cluster, x[startIndex], x[endIndex]);
        });
    };

    // 区间内内存TOPN程序趋势图
    getCpuTopNTrend = (cluster, startTime, endTime) => {
        this.setState(update(this.state, {
            cpuTopNTrend: {
                loading: {$set: true},
            },
            cpuTopNDetail: {
                loading: {$set: true}
            },
        }));
        const params = {
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.startTime2 || this.startTime1,
            endTime: endTime || this.endTime2 || this.endTime1,
        };
        api.getTopProgramCpu(params).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取区间内内存TOPN程序趋势失败: ' + res.data.msg);
                this.setState({
                    cpuTopNTrend: {
                        loading: false,
                        interval: '',
                        chartOption: memoryTopNTrendOption,
                    },
                    cpuTopNDetail: {
                        dataSource: [],
                        loading: false
                    },
                });

                return;
            }
            this.getCpuTopNDetail(params);
            const data = res.data.data;
            let x = [], series = [], legend = [];

            data.programInfos.forEach((first, i) => {
                let seriesData = [];
                first.programInfos && first.programInfos.forEach(d => {
                    i === 0 && x.push(d.time);
                    seriesData.push(d.allocatedMemoryGB);
                });
                legend.push(first.programId);
                series.push(getSeries(i, first.programId, seriesData))
            });
            this.cpuTopNSeries = series;
            this.setState({
                cpuTopNTrend: {
                    loading: false,
                    interval: interval[data.interval],
                    chartOption: update(this.state.memoryTopNTrend.chartOption, {
                        legend: {data: {$set: legend}},
                        tooltip: {
                            formatter: {
                                $set: (params) => {
                                    if (!params) return;
                                    const dataIndex = params.dataIndex;
                                    const seriesIndex = params.seriesIndex;
                                    const program = data.programInfos[seriesIndex];
                                    if (!program) return '';
                                    const obj = program.programInfos[dataIndex];
                                    if (!obj) return '';
                                    return `时间：${ obj.time }<br/>
                                    程序ID：${ obj.programId }<br/>
                                    程序名称：${ obj.programName && obj.programName !== 'null' ? obj.programName : '' }<br/>
                                    程序类型：${ obj.type && obj.type !== 'null' ? obj.type : '' }<br/>
                                    内存用量：${ obj.allocatedMemoryGB }GB<br/>
                                    CPU个数：${ obj.allocatedVCores }`
                                }
                            }
                        },
                        xAxis: {
                            0: {data: {$set: x}},
                        },
                        series: {$set: series},
                    }),
                    pageIndex: 1
                },
            });
        });

    };

    // 各程序内存详情
    getCpuTopNDetail = (params) => {
        api.getTopProgramCpuDetail(params).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取各程序内存详情失败: ' + res.data.msg);
                this.setState({
                    cpuTopNDetail: {
                        dataSource: [],
                        loading: false
                    }
                });
                return;
            }
            this.cpuDetail = res.data;
            this.setState({
                cpuTopNDetail: {
                    dataSource: res.data.data && res.data.data.map((d, i) => ({...d, index: i + 1})),
                    loading: false
                }
            });
        });
    };

    // 获取程序历史详情
    getProgramHistoryDetail = (cluster, startTime, endTime, programName) => {
        api.getProgramHistoryDetail({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.startTime3,
            endTime: endTime || this.endTime3,
            programName: programName || '',
            currentPage: 1,
            pageSize: 2,
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取程序历史详情失败: ' + res.data.msg);
                this.setState(update(this.state, {
                    historyTable: {
                        loading: {$set: false},
                    }
                }));
                return;
            }
            const response = res.data.data;
            console.log(response);

            this.setState(update(this.state, {
                historyTable: {
                    loading: {$set: false},
                    dataSource: {$set: response.items},
                    pagination: {
                        total: {$set: response.total}
                    }
                }
            }));

        });
    };

    // 获取运行时长列表
    getOverRunningTimeProgram = (cluster, startTime) => {
        api.getOverRunningTimeProgram({
            clusterName: cluster || this.context.clusterValue,
            overRunningTime: startTime || '180',
            limit: '100',
        }).then(res => {
            if (res.data.success !== 'true') {
                message.error('获取程序历史详情失败: ' + res.data.msg);
                this.setState(update(this.state, {
                    overRunningTimeTable: {
                        loading: {$set: false},
                    }
                }));
                return;
            }
            this.setState(update(this.state, {
                overRunningTimeTable: {
                    loading: {$set: false},
                    dataSource: {$set: res.data.data},
                    pagination: {
                        total: {$set: res.data.data.length},
                    }
                }
            }));

        });
    };

    // 时间筛选(第一个筛选组)
    getTime = (e) => {
        const formatter = 'YYYY-MM-DD HH:mm:ss';
        let endTime = moment().format(formatter); //当前时间
        let startTime;
        switch (e) {
            case 1:
                startTime = moment().subtract(6, "hours").format(formatter); // 6小时
                break;
            case 2:
                startTime = moment().subtract(12, "hours").format(formatter); // 12小时
                break;
            case 3:
                startTime = moment().subtract(24, "hours").format(formatter); // 24小时
                break;
            case 4:
                startTime = moment().subtract(7, "days").format(formatter); // 7天
                break;
            default:
                break;
        }
        return {startTime, endTime};
    };

    // 总体时间筛选
    onTimeTypeChange = (e) => {
        const {startTime, endTime} = this.getTime(e.target.value);
        this.setState({timeType: e.target.value}, () => {
            if (!startTime) return;
            this.startTime1 = startTime;
            this.endTime1 = endTime;
            this.getMemoryTrend(undefined, this.startTime1, this.endTime1);
            this.getCpuTrend(undefined, this.startTime1, this.endTime1);
        });
    };

    // 历史详情时间筛选
    onHistoryTimeChange = (e) => {
        const {startTime, endTime} = this.getTime(e.target.value);
        this.setState({historyTimeType: e.target.value}, () => {
            if (!startTime) return;
            this.startTime3 = startTime;
            this.endTime3 = endTime;
            this.getProgramHistoryDetail('', this.startTime3, this.endTime3);
        });
    };

    // DatePicker
    onDatePickerStartChange = (obj, time) => {
        this.customStartTime = time;
        if (this.customStartTime && this.customEndTime) {
            if (this.customStartTime >= this.customEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }
            this.getMemoryTrend(undefined, this.customStartTime, this.customEndTime);
        }
    };
    onDatePickerEndChange = (obj, time) => {
        this.customEndTime = time;
        if (this.customStartTime && this.customEndTime) {
            if (this.customStartTime >= this.customEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }
            this.getMemoryTrend(undefined, this.customStartTime, this.customEndTime);
        }
    };

    // 刷新
    refresh = () => {
        this.getMemoryTrend(undefined, this.startTime1, this.endTime1);
    };

    // 导出内存TopN数据
    exportTopNDetail = (type) => () => {
        let data, url;
        switch (type) {
            case 'memory':
                data = this.memoryDetail;
                url = 'exportMemoryExcel';
                break;
            case 'cpu':
                data = this.cpuDetail;
                url = 'exportCpuExcel';
                break;

            default:
                return;
        }
        if (!data) {
            message.error('无可导出数据');
            return;
        }
        api[url](data).then(res => downloadFile(res));
    };


    // 拖动滑块
    sliderEvent = (start, end) => {
        const len = this.memoryTrendDataSource.length;
        if (!len) return;

        const startIndex = Math.floor(start * len - 1);
        const endIndex = Math.floor(end * len - 1);
        const startTime = this.memoryTrendDataSource[startIndex < 0 ? 0 : startIndex].time;
        const endTime = this.memoryTrendDataSource[endIndex > len - 1 ? len - 1 : endIndex].time;
        if (startTime === this.startTime2 && endTime === this.endTime2) return;
        this.startTime2 = startTime;
        this.endTime2 = endTime;
        this.setState(update(this.state, {
            memoryTrend: {
                sliderDefaultPosition: {$set: null},
            },
            memoryTopNTrend: {
                loading: {$set: true},
            }
        }));
        this.getMemoryTopNTrend('', startTime, endTime);

    };

    // TopN图翻页
    onTopNPageChange = (type) => (page) => {
        this.setState(update(this.state, {
            [type]: {
                pageIndex: {$set: page},
            }
        }))
    };

    // 分页、排序、筛选变化时触发
    historyTableChange = (pagination, filters, sorter) => {
        console.log(pagination, filters, sorter);
    };


    render() {
        const state = this.state;

        return (
            <Fragment>
                <Form layout="inline">
                    <FormItem label="时间选择" colon={ false }>
                        <Radio.Group
                            className="radio-button"
                            onChange={ this.onTimeTypeChange }
                            value={ state.timeType }>
                            <Radio.Button key={ 'time_' + 1 } value={ 1 }>最近6小时</Radio.Button>
                            <Radio.Button key={ 'time_' + 2 } value={ 2 }>最近12小时</Radio.Button>
                            <Radio.Button key={ 'time_' + 3 } value={ 3 }>最近24小时</Radio.Button>
                            <Radio.Button key={ 'time_' + 4 } value={ 4 }>最近7天</Radio.Button>
                            <Radio.Button key={ 'time_' + 0 } value={ 0 }>自定义</Radio.Button>
                        </Radio.Group>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="开始时间"
                            disabled={ state.timeType !== 0 }
                            style={ {marginRight: '12px'} }
                            onChange={ this.onDatePickerStartChange }/>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="结束时间"
                            disabled={ state.timeType !== 0 }
                            style={ {marginRight: '12px'} }
                            onChange={ this.onDatePickerEndChange }/>

                        <Button htmlType="button"
                                type="primary"
                                className="sd-minor"
                                onClick={ this.refresh }
                                style={ {height: '30px', lineHeight: '30px'} }
                        >刷新</Button>
                    </FormItem>
                </Form>

                <div className="part">
                    <Card
                        size="small"
                        className="grey-card-title left"
                        title={ <span><Icon type="dashboard"/>内存</span> }
                        extra={
                            <span>总内存：{ state.memoryTotalSpace.memory } | 总磁盘空间：{ state.memoryTotalSpace.disk }</span> }>
                        <Block
                            block1={ {
                                id: 'memoryTrend',
                                title: '集群内存总体趋势图',
                                sliderEvent: this.sliderEvent,
                                ...state.memoryTrend,
                            } }
                            block2={ {
                                id: 'memoryTopNTrend',
                                title: '区间内TOPN程序内存趋势图',
                                onPageChange: this.onTopNPageChange('memoryTopNTrend'),
                                ...state.memoryTopNTrend,
                            } }
                            block3={ {
                                title: '区间内TOPN程序内存详情',
                                exportExcel: this.exportTopNDetail('memory'),
                                options: {
                                    id: 'left',
                                    rowKey: 'index',
                                    columns: this.memoryTopNColumns,
                                    ...state.memoryTopNDetail,
                                },
                            } }
                        />
                    </Card>

                    <Card
                        size="small"
                        className="grey-card-title right"
                        title={ <span><Icon type="stock"/>CPU</span> }
                        extra={
                            <span>总CPU：{ state.cpuTotalSpace.cpu }GB | 总磁盘空间：{ state.cpuTotalSpace.disk }TB</span> }
                    >
                        <Block
                            block1={ {
                                id: 'cpuTrend',
                                title: '集群CPU总体趋势图',
                                sliderEvent: this.sliderEvent,
                                ...state.cpuTrend,
                            } }
                            block2={ {
                                id: 'cpuTopNTrend',
                                title: '区间内TOPN程序CPU趋势图',
                                onPageChange: this.onTopNPageChange('cpuTopNTrend'),
                                ...state.cpuTopNTrend,
                            } }
                            block3={ {
                                title: '区间内TOPN程序CPU详情',
                                exportExcel: this.exportTopNDetail('cpu'),
                                options: {
                                    id: 'left',
                                    rowKey: 'index',
                                    columns: this.cpuTopNColumns,
                                    ...state.cpuTopNDetail,
                                },
                            } }
                        />
                    </Card>
                </div>

                <div className="program-history">
                    <Card
                        size="small"
                        style={ {width: '100%'} }
                        className="grey-card-title"
                        title={ <span><Icon type="dashboard"/>程序历史详情</span> }
                    >
                        <div className="sd-filter-form">
                            <Input.Search placeholder="请输入关键字" style={ {width: '150px'} }/>
                            <Radio.Group
                                className="radio-button" onChange={ this.onHistoryTimeChange }
                                value={ state.historyTimeType }>
                                <Radio.Button key={ 'time_running_' + 1 } value={ 1 }>最近6小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 2 } value={ 2 }>最近12小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 3 } value={ 3 }>最近24小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 4 } value={ 4 }>最近7天</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 0 } value={ 0 }>自定义</Radio.Button>
                            </Radio.Group>
                            <DatePicker
                                disabled={ state.historyTimeType !== 0 }
                                style={ {marginRight: '12px'} }
                                onChange={ this.onChange }/>
                            <DatePicker
                                disabled={ state.historyTimeType !== 0 }
                                onChange={ this.onChange }/>
                        </div>
                        <SDTable
                            rowKey="programId"
                            columns={ this.historyColumns }
                            onChange={ this.historyTableChange }
                            className="sd-table-simple tr-color-interval"
                            { ...state.historyTable }
                        />
                    </Card>
                </div>

                <div className="program-running">
                    <Card
                        size="small"
                        style={ {width: '100%'} }
                        className="grey-card-title"
                        title={ <span><Icon type="dashboard"/>程序运行时长</span> }
                    >
                        <div className="sd-filter-form">
                            <span style={ {color: '#404040'} }>
                                运行时长超过<Input value={ state.runningTime } style={ {width: '80px', margin: '0 5px'} }/>分钟
                            </span>
                            <Button
                                htmlType="button"
                                type="primary"
                                className="sd-minor"
                                style={ {margin: '0 6px 0 8px'} }
                            >刷新</Button>
                        </div>
                        <SDTable
                            rowKey="programId"
                            columns={ this.overRunningTimeColumns }
                            className="sd-table-simple tr-color-interval"
                            { ...state.overRunningTimeTable }
                        />
                    </Card>
                </div>
            </Fragment>
        )
    }
}