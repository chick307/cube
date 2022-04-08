module.exports = {
    plugins: [
        'postcss-import',
        'postcss-nesting',
        [
            'postcss-url',
            { url: 'rebase' },
        ],
    ],
};
