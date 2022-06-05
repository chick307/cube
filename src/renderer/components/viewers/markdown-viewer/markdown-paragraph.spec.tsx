import { act, cleanup, render } from '@testing-library/react';

import { MarkdownParagraph } from './markdown-paragraph';
import styles from './markdown-paragraph.module.css';

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

describe('MarkdownParagraph component', () => {
    test('it renders a paragraph element', () => {
        const Component = () => {
            return (
                <MarkdownParagraph>
                    paragraph
                </MarkdownParagraph>
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const markdownParagraphs = Array.from(container.getElementsByClassName(styles.markdownParagraph));
        expect(markdownParagraphs).toEqual([expect.objectContaining({ tagName: 'P', textContent: 'paragraph' })]);
    });

    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return (
                    <MarkdownParagraph className={'test-class'}>
                        paragraph
                    </MarkdownParagraph>
                );
            };
            act(() => {
                render(<Component />, { container });
            });
            const markdownParagraph = container.getElementsByClassName(styles.markdownParagraph)[0];
            expect(markdownParagraph.classList.contains('test-class')).toBe(true);
        });
    });
});
