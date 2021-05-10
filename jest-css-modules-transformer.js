const path = require('path');

const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

module.exports = {
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
        const prefix = path.relative(__dirname, filePath).replace(/\.css$/, '--');
        for (const n of names) {
            exports[n] = prefix + n;
            exports[n.replaceAll(/-+(\w)/g, (_, c) => c.toUpperCase())] = prefix + n;
        }

        const code = `module.exports = ${JSON.stringify(exports)};`;
        return { code };
    },
};
