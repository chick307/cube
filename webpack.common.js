const path = require('path');

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
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    target: 'node',
};
