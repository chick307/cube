const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: {
        main: './src/entries/main.ts',
    },
    externals: [
        { electron: 'commonjs electron' },
    ],
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        filename: path.join('entries', '[name].js'),
    },
    plugins: [
        new CopyPlugin([{ from: 'src/views', to: 'views' }]),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    target: 'node',
};
