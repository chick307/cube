import { act, cleanup, render } from '@testing-library/react';

import { MarkdownBlockquote } from './markdown-blockquote';
import styles from './markdown-blockquote.module.css';

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    cleanup();
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
        act(() => {
            render(<Component />, { container });
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
            act(() => {
                render(<Component />, { container });
            });
            const markdownBlockquote = container.getElementsByClassName(styles.markdownBlockquote)[0];
            expect(markdownBlockquote.classList.contains('test-class')).toBe(true);
        });
    });
});
