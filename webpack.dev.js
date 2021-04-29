const path = require('path');

const config = require('./webpack.common.js');

module.exports = config({
    devtool: 'inline-source-map',
    mode: 'development',
    path: path.resolve(__dirname, 'dist/webpack/dev'),
});
