const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(proxy('/auth', {
        target: 'http://172.168.201.40:9030',
        secure: false,
        changeOrigin: true,
        // pathRewrite: {
        //     "^/api": "/"
        // },
        // cookieDomainRewrite: "http://localhost:3000"
    }));
    app.use(proxy('/automatic', {
        target: 'http://172.168.201.40:9030',
        secure: false,
        changeOrigin: true,
    }));
    app.use(proxy('/cdhnm', {
        target: 'http://172.168.201.40:9030',
        secure: false,
        changeOrigin: true,
    }));
};