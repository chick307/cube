const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = (options) => {
    return {
        context: __dirname,
        devtool: options.devtool,
        entry: {},
        mode: options.mode,
        output: {
            filename: path.join('entries', '[name].js'),
            path: options.path,
        },
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
            rules: [
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
            new CopyPlugin({ patterns: [{ from: 'src/renderer/views', to: 'views' }] }),
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
