import path from 'path';

import { config } from './webpack.common.js';

export default config({
    mode: 'production',
    path: path.resolve(new URL(import.meta.url).pathname, '../dist/webpack/prod'),
});
