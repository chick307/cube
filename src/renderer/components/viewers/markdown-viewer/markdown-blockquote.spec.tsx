import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { MarkdownBlockquote } from './markdown-blockquote';
import styles from './markdown-blockquote.module.css';

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;
});

describe('MarkdownBlockquote component', () => {
    test('it renders a blockquote element', () => {
        const Component = () => {
            return (
                <MarkdownBlockquote>
                    blockquote
                </MarkdownBlockquote>
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        const markdownBlockquotes = Array.from(container.getElementsByClassName(styles.markdownBlockquote));
        expect(markdownBlockquotes)
            .toEqual([expect.objectContaining({ tagName: 'BLOCKQUOTE', textContent: 'blockquote' })]);
    });

    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return (
                    <MarkdownBlockquote className={'test-class'}>
                        blockquote
                    </MarkdownBlockquote>
                );
            };
            TestUtils.act(() => {
                ReactDom.render(<Component />, container);
            });
            const markdownBlockquote = container.getElementsByClassName(styles.markdownBlockquote)[0];
            expect(markdownBlockquote.classList.contains('test-class')).toBe(true);
        });
    });
});
