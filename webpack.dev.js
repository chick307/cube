import path from 'node:path';

import { config } from './webpack.common.js';

export default config({
    cssLoaderOptions: {
        modules: {
            localIdentName: '[local]__[path][name]',
        },
    },
    devtool: 'inline-source-map',
    mode: 'development',
    path: path.resolve(new URL(import.meta.url).pathname, '../dist/webpack/dev'),
    tsLoaderOptions: {
        compilerOptions: {
            jsx: 'react-jsxdev',
        },
    },
});
