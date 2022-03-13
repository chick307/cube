import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { MarkdownCode } from './markdown-code';
import styles from './markdown-code.module.css';

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

describe('MarkdownCode component', () => {
    test('it renders a code element', () => {
        const Component = () => {
            return (
                <MarkdownCode>
                    code
                </MarkdownCode>
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        const markdownCodes = Array.from(container.getElementsByClassName(styles.markdownCode));
        expect(markdownCodes).toEqual([expect.objectContaining({ tagName: 'CODE', textContent: 'code' })]);
    });

    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return (
                    <MarkdownCode className={'test-class'}>
                        code
                    </MarkdownCode>
                );
            };
            TestUtils.act(() => {
                ReactDom.render(<Component />, container);
            });
            const markdownCode = container.getElementsByClassName(styles.markdownCode)[0];
            expect(markdownCode.classList.contains('test-class')).toBe(true);
        });
    });
});