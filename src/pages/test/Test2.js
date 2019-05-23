import React from 'react';
import echarts from 'echarts';
import api from 'src/tools/api';

var colors = ['#5793f3', '#d14a61', '#675bba'];

let start = 0;
let end = 5;

export const chartOption = {
    color: colors,

    tooltip: {
        trigger: 'item',
        axisPointer: {type: 'shadow'},
    },
    grid: {
        right: '20%'
    },
    legend: {
        data: ['蒸发量', '降水量', '平均温度']
    },
    xAxis: [
        {
            type: 'category',
            axisTick: {
                alignWithLabel: true
            },
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '蒸发量-yAxis',
            min: 0,
            max: 250,
            position: 'right',
            axisLine: {
                lineStyle: {
                    color: colors[0]
                }
            },
            axisLabel: {
                formatter: '{value} ml'
            }
        },
        {
            show: false,
            type: 'value',
            name: '降水量-yAxis',
            min: 0,
            max: 250,
            position: 'right',
            offset: 80,
            axisLine: {
                lineStyle: {
                    color: colors[1]
                }
            },
            axisLabel: {
                formatter: '{value} ml'
            }
        },
        {
            type: 'value',
            name: '温度-yAxis',
            min: 0,
            max: 25,
            position: 'left',
            axisLine: {
                lineStyle: {
                    color: colors[2]
                }
            },
            axisLabel: {
                formatter: '{value} °C'
            }
        }
    ],
    series: [
        {
            name: '蒸发量-series',
            type: 'bar',
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
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
                data: [
                    [{
                        xAxis: start, // index
                    }, {
                        xAxis: end, // index
                    },]
                ],
            }
        },
        {
            name: '降水量-series',
            type: 'line',
            yAxisIndex: 1,
            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
        },
        {
            name: 'average-series', // 与state.dataSource一致
            type: 'line',
            yAxisIndex: 2,
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2],
        }
    ]
};

export default class Test extends React.Component {
    componentDidMount() {
        const myChart = echarts.init(document.getElementById('main'));
        myChart.setOption(chartOption);

        // const interval = setInterval(() => {
        //     if (end > 12) {
        //         clearInterval(interval);
        //         return;
        //     }
        //     myChart.setOption(update(chartOption, {
        //         series: {
        //             0: {
        //                 markArea: {
        //                     data: {
        //                         $set: [
        //                             [{
        //                                 xAxis: start + 1, // index
        //                             }, {
        //                                 xAxis: end + 1, // index
        //                             },]
        //                         ]
        //                     }
        //                 }
        //             }
        //         }
        //     }));
        //     start = start + 1;
        //     end = end + 1;
        // }, 1000);


        this.connectWebsocket();
    }

    connectWebsocket = () => {
        // const wsUri = `ws://${ window.location.host }/cdhnm/diskFailureRecovery/websocket`;
        // const wsUri = `ws://172.168.201.40:9999/cdhnm/diskFailureRecovery/websocket`;

        this.websocket = new WebSocket(api.wsUrl, `WS-DATAE-TOKEN.${ localStorage.getItem('token') }`);
        this.websocket.onopen = function (evt) {
            console.log('onopen', evt);

            this.send(JSON.stringify({taskId: 100}));
        };
        this.websocket.onclose = function (evt) {
            console.log('onclose', evt);
        };
        this.websocket.onmessage = function (evt) {
            console.log('onmessage', evt);
        };
        this.websocket.onerror = function (evt) {
            console.log('onerror', evt);
        };


    };

    render() {
        return <div id="main" style={ {width: '600px', height: '400px'} }/>
    }
}