const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const common = (options) => {
    return {
        context: __dirname,
        devtool: options.devtool,
        entry: {},
        mode: options.mode,
        module: {
            rules: [
                // See https://github.com/ashtuchkin/iconv-lite/issues/204#issuecomment-432048618
                {
                    resolve: {
                        aliasFields: ['main'],
                    },
                    test: /node_modules\/iconv-lite\/.+/,
                },
            ],
        },
        output: {
            filename: path.join('entries', '[name].js'),
            path: options.path,
        },
        plugins: [
            new webpack.DefinePlugin({
                /* eslint-disable @typescript-eslint/naming-convention */
                BUILD_MODE: JSON.stringify(options.mode),
                SharedArrayBuffer: 'ArrayBuffer',
                /* eslint-enable @typescript-eslint/naming-convention */
            }),
        ],
    };
};

const electronCommon = (options) => {
    const base = common(options);
    return {
        ...base,
        externalsPresets: {
            electron: true,
            node: true,
        },
        module: {
            ...base.module,
            rules: [
                ...base.module.rules,
                {
                    exclude: [
                        path.resolve(__dirname, 'node_modules'),
                    ],
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: options.tsLoaderOptions,
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
    };
};

const electronMain = (options) => {
    const base = electronCommon(options);
    return {
        ...base,
        entry: {
            main: './src/main/entries/main.ts',
        },
        externalsPresets: {
            ...base.externalsPresets,
            electronMain: true,
        },
        target: 'electron-main',
    };
};

const electronRenderer = (options) => {
    const base = electronCommon(options);
    return {
        ...base,
        entry: {
            'main-window': './src/renderer/entries/main-window.tsx',
        },
        externalsPresets: {
            ...base.externalsPresets,
            electronRenderer: true,
        },
        module: {
            ...base.module,
            rules: [
                ...base.module.rules,
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                ...options.cssLoaderOptions,
                                modules: {
                                    exportLocalsConvention: 'camelCase',
                                    ...options.cssLoaderOptions?.modules,
                                },
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            ...base.plugins,
            new CopyPlugin({
                patterns: [
                    { from: 'src/renderer/views', to: 'views' },
                    { from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js', to: 'workers' },
                    { from: 'node_modules/pdfjs-dist/cmaps', to: 'cmaps' },
                ],
            }),
            new MiniCssExtractPlugin({ filename: path.join('styles', '[name].css') }),
        ],
        target: 'electron-renderer',
    };
};

const assets = (options) => {
    const base = common(options);
    return {
        ...base,
        plugins: [
            ...base.plugins,
            new CopyPlugin({ patterns: [{ from: 'assets/images', to: 'images' }] }),
        ],
    };
};

module.exports = (options) => {
    return [
        electronMain(options),
        electronRenderer(options),
        assets(options),
    ];
};
