const path = require('path');

const config = require('./webpack.common.js');

module.exports = config({
    mode: 'production',
    path: path.resolve(__dirname, 'dist/webpack/prod'),
});
