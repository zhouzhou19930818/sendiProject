import update from 'immutability-helper';
import echarts from 'echarts';

const axisColor = '#8E97A2';
const colors1 = ['#F8CA3E', '#00AAE5', '#E152FB'];
const colors1Shadow = ['rgba(248,202,62,0.1)', 'rgba(0,170,229,0.1)', 'rgba(225,82,251,0.1)'];
const colors2 = ['#e40000', '#e45500', '#ff8943', '#ffca2c', '#f9e582', '#6ec6ff', '#1284fe', '#2463f4', '#164ed0', '#4f2ce6',];
const colors2Shadow = ['rgba(228,0,0,0.1)', 'rgba(228,85,0,0.1)', 'rgba(255,137,0,0.1)', 'rgba(255,202,44,0.1)', 'rgba(249,229,130)', 'rgba(110,198,255)', 'rgba(18,132,254)', 'rgba(36,99,244)', 'rgba(22,78,208)', 'rgba(79,44,230)',];
export const memoryTopNSeries = {
    name: '',
    type: 'line',
    stack: 'Stack',
    smooth: true,
    // symbol: 'circle',
    // symbolSize: 2,
    // showSymbol: false,
    lineStyle: {
        normal: {
            width: 1
        }
    },
    data: []
};


export const memoryTrendOption = {
    color: colors1,
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            lineStyle: {
                color: '#57617B'
            }
        },
        // formatter: (params) => {
        //     console.log(params);//.dataIndex
        // }
    },
    grid: {
        top: "20%",
        bottom: "30%",
        left: '10%',
        // right: '15%',
    },
    legend: {
        textStyle: {color: axisColor},
        selectedMode: false,//取消图例上的点击事件
        itemWidth: 10,
        itemHeight: 10,
        data: ['内存使用量占比', '磁盘使用空间占比', '正在运行程序', '分配中程序'],
    },
    xAxis: [
        {
            type: 'category',
            axisLabel: {
                color: axisColor,
                align: 'left'
            },
            axisLine: {
                lineStyle: {color: axisColor}
            },
            axisTick: {show: false},
            data: [],
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '百分比（%）',
            position: 'left',
            nameTextStyle: {color: axisColor},
            min: 0,
            max: 100,
            splitLine: {show: false},
            axisLine: {show: false},
            axisTick: {show: false},
            axisLabel: {color: axisColor},
            splitArea: {show: false},
        },
        {
            show: false,
            type: 'value',
            name: '百分比（%）',
            min: 0,
            max: 100,
            position: 'left',
            offset: 80,
        },
        {
            type: 'value',
            name: '程序个数',
            // min: 0,
            // max: 100,
            position: 'right',
            nameTextStyle: {color: axisColor},
            splitLine: {show: false},
            axisLine: {show: false,},
            axisTick: {show: false},
            axisLabel: {color: axisColor},
            splitArea: {show: false},
        },
    ],
    series: [
        {
            name: '正在运行程序',
            yAxisIndex: 2,
            type: 'bar',
            stack: 'Stack',
            itemStyle: {
                color: '#0b61ba',
                barBorderRadius: 11,
            },
            markLine: {
                silent: true, // 需要有tooltip显示则设置为false
                symbol: 'none',
                data: [
                    {
                        yAxis: 150
                    },
                ],
                lineStyle: {
                    color: '#F15BC5',
                    type: 'solid'
                },
                label: {
                    position: 'middle',
                    formatter: '集群总内存'
                },
            },
            markArea: {
                silent: true, // 需要有tooltip显示则设置为false
                itemStyle: {
                    color: axisColor,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    shadowBlur: 1,
                    opacity: 0.2,
                },
                data: [
                    [{
                        x: 0, // index
                    }, {
                        x: 0, // index
                    },]
                ],
            },
            data: [],
        },
        {
            name: '分配中程序',
            yAxisIndex: 2,
            type: 'bar',
            stack: 'Stack',
            itemStyle: {
                color: '#53a8ff',
                barBorderRadius: 11,
            },
            data: [],
        },
        {
            name: '内存使用量占比',
            yAxisIndex: 0,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: colors1[1],
                    }, {
                        offset: 0.5,
                        color: colors1Shadow[1],
                    }], false),
                    // shadowColor: 'rgba(0, 0, 0, 0.1)',
                    // shadowBlur: 10
                }
            },
            itemStyle: {
                normal: {
                    color: colors1[1],
                    borderColor: colors1Shadow[1],
                    borderWidth: 12

                }
            },
            data: [],
        },
        {
            name: '磁盘使用空间占比',
            yAxisIndex: 1,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: colors1[2],
                    }, {
                        offset: 0.8,
                        color: colors1Shadow[2]
                    }], false),
                    shadowColor: colors1Shadow[2],
                    shadowBlur: 10
                }
            },
            itemStyle: {
                normal: {
                    color: colors1[2],
                    borderColor: colors1Shadow[2],
                    borderWidth: 12

                }
            },
            data: [],
        },
    ]
};

export const memoryTopNTrendOption = {
    color: colors2,
    tooltip: {
        show: true,
    },
    grid: {
        top: "20%",
        bottom: "10%",
        left: '10%',
        right: '15%'
    },
    legend: {
        textStyle: {color: axisColor},
        selectedMode: false,//取消图例上的点击事件
        itemWidth: 10,
        itemHeight: 10,
        formatter: function (name) {
            // return echarts.format.truncateText(name, 100, '14px Microsoft Yahei', '…');
            const start = name.substr(0, 1);
            const end = name.substr(-4);
            return `${ start }...${ end }`;
        },
        data: [],
    },
    xAxis: [{
        type: "category",
        // boundaryGap: false,
        axisLine: {show: false,},
        axisLabel: {
            color: axisColor,
            align: 'left'
        },
        splitLine: {show: false},
        axisTick: {show: false},
        data: [],
    }],
    yAxis: [{
        type: "value",
        name: '内存(GB)',
        nameTextStyle: {color: axisColor},
        splitLine: {show: false},
        axisLine: {show: false,},
        axisTick: {show: false},
        axisLabel: {color: axisColor},
    }],
    series: [],
};

export function getSeries(i, name, data) {
    return update(memoryTopNSeries, {
        name: {$set: name},
        data: {$set: data},
        lineStyle: {
            normal: {
                color: {$set: colors2[i]}, // 线条颜色
            },
        },
        areaStyle: {
            $set: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0.1,
                        color: colors2Shadow[i],
                    }, {
                        offset: 0.8,
                        color: 'rgba(225,225,225,0.1)',
                    }], false),
                    // shadowColor: 'rgba(0, 0, 0, 0.1)',
                    // shadowBlur: 10
                }
            }
        },
    })
}
