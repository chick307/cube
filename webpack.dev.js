const path = require('path');

const common = require('./webpack.common.js');

module.exports = {
    ...common,
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        ...common.output,
        path: path.resolve(__dirname, 'debug'),
    },
};
