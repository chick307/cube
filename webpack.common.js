const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const electronCommon = (options) => {
    return {
        context: __dirname,
        devtool: options.devtool,
        externalsPresets: {
            electron: true,
            node: true,
        },
        mode: options.mode,
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: [
                        path.resolve(__dirname, 'node_modules'),
                    ],
                    use: [
                        {
                            loader: 'ts-loader',
                        },
                    ],
                },
            ],
        },
        output: {
            filename: path.join('entries', '[name].js'),
            path: options.path,
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
            'main': './src/entries/main.ts',
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
            'main-window': './src/entries/main-window.tsx',
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
            new CopyPlugin({ patterns: [{ from: 'src/views', to: 'views' }] }),
            new MiniCssExtractPlugin({ filename: path.join('styles', '[name].css') }),
        ],
        target: 'electron-renderer',
    };
};

module.exports = (options) => {
    return [
        electronMain(options),
        electronRenderer(options),
    ];
};
