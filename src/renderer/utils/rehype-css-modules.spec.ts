import { h } from 'hastscript';
import { rehypeCssModules } from './rehype-css-modules';

describe('rehypeCssModules() function', () => {
    test('it replaces class names in a hypertext AST', () => {
        const transformer = rehypeCssModules({ styles: { 'class-name': 'className' } });
        const node = h(null, h('div', { className: 'class-name' }, h('span', { className: 'inline' })));
        transformer(node);
        expect(node).toEqual(h(null, h('div', { className: 'className' }, h('span', { className: [] }))));
    });
});
