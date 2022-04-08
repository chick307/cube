import path from 'path';

import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

const common = (options) => {
    return {
        context: path.resolve(new URL(import.meta.url).pathname, '..'),
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
            filename: path.join('entries', '[name].cjs'),
            path: options.path,
        },
        plugins: [
            new webpack.DefinePlugin({
                BUILD_MODE: JSON.stringify(options.mode),
                SharedArrayBuffer: 'ArrayBuffer',
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
                        path.resolve(new URL(import.meta.url).pathname, '../node_modules'),
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
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        'postcss-nesting',
                                    ],
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

export const config = (options) => {
    return [
        electronMain(options),
        electronRenderer(options),
        assets(options),
    ];
};
