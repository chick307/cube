import path from 'node:path';

import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export default {
    process(src, filePath) {
        const root = postcss.parse(src);

        const names = new Set();
        root.walkRules((rule) => {
            const selector = selectorParser().astSync(rule.selector);
            selector.walk((node) => {
                if (node.type === 'pseudo' && node.value === ':global') {
                    node.empty();
                } else if (node.type === 'class' || node.type === 'id') {
                    names.add(node.value);
                }
            });
        });

        const exports = {};
        const rootDir = path.dirname(new URL(import.meta.url).pathname);
        const prefix = path.relative(rootDir, filePath).replace(/(?:\.module)?\.css$/, '--').replaceAll(/[^\w]/g, '-');
        for (const n of names) {
            exports[n] = prefix + n;
            exports[n.replaceAll(/-+(\w)/g, (_, c) => c.toUpperCase())] = prefix + n;
        }

        const code = `module.exports = ${JSON.stringify(exports)};`;
        return { code };
    },
};
