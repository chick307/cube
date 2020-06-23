const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    context: __dirname,
    entry: {
        'main': './src/entries/main.ts',
        'main-window': './src/entries/main-window.tsx',
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
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            localsConvention: 'camelCase',
                            modules: true,
                        },
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
        new CopyPlugin({ patterns: [{ from: 'src/views', to: 'views' }] }),
        new MiniCssExtractPlugin({ filename: path.join('styles', '[name].css') }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    target: 'node',
};
