import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tabs } from 'antd';
import Program from 'src/pages/yarn/Program';
import { ContainerBody } from "src/components/LittleComponents";

import 'src/assets/css/yarn.scss';
import api from "../../tools/api";

const TabPane = Tabs.TabPane;
const {Option} = Select;

export default class YarnAnalysis extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clusterValue: '',
        };

        this.clusterOptions = []; // 集群下拉框选项

        this.panes = [
            {
                key: 'tab1',
                title: '程序',
                content: <Program/>,
            }, {
                key: 'tab2',
                title: '队列',
                content: <Program/>,
            }, {
                key: 'tab3',
                title: '租户',
                content: <Program/>,
            }, {
                key: 'tab4',
                title: '应用',
                content: <Program/>,
            },
        ];
    }


    static childContextTypes = {
        clusterValue: PropTypes.string,
    };

    getChildContext() {
        return {
            clusterValue: this.state.clusterValue,
        }
    }

    componentDidMount(nextProps, nextContext) {
        this.getThunkOptions();
    }


    // 获取集群列表
    getThunkOptions = () => {
        api.getClusterBasicInfo().then(res => {
            if (res.data.success !== 'true') {
                return;
            }
            this.clusterOptions = res.data.data;
            this.setState({
                clusterValue: res.data.data[0].clusterName
            }, () => {
            });
        });
    };

    // 集群选项修改事件
    onThunkChange = (value) => {
        this.setState({
            clusterValue: value,
        });
    };

    render() {
        const state = this.state;
        return (
            <ContainerBody>
                <Form layout="inline">
                    <Form.Item label="集群选择" colon={ false }>
                        <Select
                            style={ {width: '160px', margin: '0 6px 0 8px'} }
                            value={ state.clusterValue }
                            onChange={ this.onThunkChange }
                        >
                            {
                                this.clusterOptions.map((d, i) =>
                                    <Option key={ 'cluster_' + i } value={ d.clusterName }>{ d.clusterName }</Option>)
                            }
                        </Select>
                    </Form.Item>
                </Form>
                <Tabs
                    className="sd-tabs"
                    onChange={ this.onTabsChange }
                    onEdit={ this.onEdit }
                >
                    {
                        this.panes.map(pane =>
                            <TabPane key={ pane.key } tab={ pane.title }>{ pane.content }</TabPane>)
                    }
                </Tabs>
            </ContainerBody>
        )
    }
}