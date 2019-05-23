import React from 'react';
import axios from 'axios';

export default class ProxyTest extends React.Component {

    componentDidMount() {
        axios({
            url: "/api/getEncryption",
            method: "get"
        }).then(res => {
            console.log(res);
        });
        axios({
            url: "/apc/getEncryption",
            method: "get"
        }).then(res => {
            console.log(res);
        });
    }

    render() {
        return '';
    }
}