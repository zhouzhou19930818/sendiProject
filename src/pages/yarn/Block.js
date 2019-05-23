import React from 'react';
import { Button, Radio } from "antd";
import echarts from "echarts";
import SDTable from 'src/components/SDTable';
import SliderChart from './SliderChart';

const chartLoadingStyle = {
    text: 'loading',
    color: '#2AA0FF',
    textColor: '#2AA0FF',
    // maskColor: 'rgba(255, 255, 255, 0.1)',
};

export default class Block extends React.Component {
    state = {
        dataSource: [],
        chart1Option: this.props.block1.chartOption,
        chart2Option: this.props.block2.chartOption,
    };

    dataSource = [];

    columns = [
        {
            title: '程序名称',
            dataIndex: 'name',
            key: 'name',
            width: '100px',
        }, {
            title: '内存',
            dataIndex: 'memory',
            key: 'memory',
            width: '50px',
        }, {
            title: 'CPU',
            dataIndex: 'cpu',
            key: 'cpu',
            width: '50px',
        }, {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: '150px',
        },
    ];

    componentDidMount() {
        this.block2Chart = echarts.init(document.getElementById(this.props.block2.id));
        this.block2Chart.setOption(this.props.block2.chartOption);

        this.block2Chart.showLoading(chartLoadingStyle);
        this.chartSlider.chart.showLoading(chartLoadingStyle);

        window.addEventListener("resize", () => {
            // myChart1.resize();
            this.block2Chart.resize();
        });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const block1 = nextProps.block1;
        const block2 = nextProps.block2;
        if (block1.loading) {
            this.chartSlider.chart.showLoading(chartLoadingStyle);
        } else {
            if (block1.loading !== this.props.block1.loading) {
                this.chartSlider.chart.hideLoading(); // 撤去loading
                this.chartSlider.chart.clear();
                this.chartSlider.chart.setOption(block1.chartOption); // 更新图表
                if (block1.sliderDefaultPosition) {
                    this.chartSlider.setSlider(block1.sliderDefaultPosition.start, block1.sliderDefaultPosition.end); // 设置滑块位置
                }
            }
        }


        if (block2.loading) {
            this.block2Chart.showLoading(chartLoadingStyle);
        } else {
            if (block2.loading !== this.props.block2.loading) {
                this.block2Chart.hideLoading();
                this.block2Chart.clear();
                this.block2Chart.setOption(block2.chartOption);
            }
        }
    }

    // 获取时间间隔
    getInterval = (str) => {
        if (!str) return '';
        const intervalList = str.match(/[\u4e00-\u9fa5]|\d+/gm);
        let block1Interval = '';
        (intervalList && intervalList.length) && intervalList.forEach(d => block1Interval = block1Interval + `${ d }<br/>`);
        return block1Interval;
    };

    render() {
        const props = this.props;
        const block1 = props.block1;
        const block2 = props.block2;
        const block3 = props.block3;
        return (
            <div className="block-wrapper">
                <div className="block">
                    <div className="title">{ block1.title }</div>
                    <div className="body">
                        <SliderChart
                            id={ block1.id }
                            ref={ e => this.chartSlider = e }
                            options={ block1.chartOption }
                            sliderEvent={ block1.sliderEvent }
                        />
                        <span dangerouslySetInnerHTML={ {__html: this.getInterval(block1.interval)} }
                              style={ {
                                  color: '#8E97A2',
                                  fontSize: '12',
                                  fontWeight: '600',
                                  position: 'absolute',
                                  right: '8px',
                                  top: '20%',
                              } }
                        />
                    </div>
                </div>
                <div className="block">
                    <div className="title">
                        { block2.title }
                        {
                            block2.chartOption.series && block2.chartOption.series.length < 10 ?
                                <Radio.Group
                                    className="radio-button"
                                    style={ {float: 'right'} }
                                    onChange={ block2.onPageChange }
                                    value={ block2.pageIndex }
                                >
                                    <Radio.Button key={ block2.id + 1 } value={ 1 }>Top10</Radio.Button>
                                    <Radio.Button key={ block2.id + 2 } value={ 2 }>Top11-20</Radio.Button>
                                </Radio.Group> : null
                        }
                    </div>
                    <div className="body">
                        <div id={ block2.id } className="chart-table"/>
                        <span dangerouslySetInnerHTML={ {__html: this.getInterval(block2.interval)} }
                              style={ {
                                  color: '#8E97A2',
                                  fontSize: '12',
                                  fontWeight: '600',
                                  position: 'absolute',
                                  right: '8px',
                                  top: '20%',
                              } }
                        />
                    </div>
                </div>
                <div className="block">
                    <div className="title" style={ {paddingRight: '20px'} }>
                        { block3.title }
                        <Button type="primary"
                                className="sd-minor"
                                onClick={ block3.exportExcel }
                                style={ {float: 'right'} }
                        >导出</Button>
                    </div>
                    <div className="body">
                        <SDTable
                            bordered={ true }
                            className="sd-table-simple tr-color-interval"
                            style={ {padding: '16px'} }
                            pagination={ false }
                            scroll={ {y: 200} }
                            { ...block3.options }
                        />
                    </div>
                </div>
            </div>
        )
    }
}
