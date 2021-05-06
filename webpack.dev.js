const path = require('path');

const config = require('./webpack.common.js');

module.exports = config({
    cssLoaderOptions: {
        modules: {
            localIdentName: '[local]__[path][name]',
        },
    },
    devtool: 'inline-source-map',
    mode: 'development',
    path: path.resolve(__dirname, 'dist/webpack/dev'),
    tsLoaderOptions: {
        compilerOptions: {
            jsx: 'react-jsxdev',
        },
    },
});
