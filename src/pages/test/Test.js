import React from 'react';
import SliderChart from '../yarn/SliderChart';

const colors = ['#5793f3', '#d14a61', '#675bba'];
const chart1Option = {
    color: colors,

    tooltip: {
        trigger: 'item',
        axisPointer: {type: 'shadow'},
        // formatter: (params) => {
        //     console.log(params);//.dataIndex
        // }
    },
    grid: {
        top: "25%",
        bottom: "20%"
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
                        x: 0, // index
                    }, {
                        x: 0, // index
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

    render() {
        return <div>
            <div style={ {width: '50%'} }>
                <SliderChart id="test1" options={ chart1Option } sliderEvent={ this.sliderEvent }/>
            </div>
            <div style={ {width: '50%'} }>
                <SliderChart id="test2" options={ chart1Option } sliderEvent={ this.sliderEvent }/>
            </div>
        </div>
    }
}