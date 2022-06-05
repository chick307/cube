import { act, cleanup, render } from '@testing-library/react';

import { MarkdownTable } from './markdown-table';
import styles from './markdown-table.module.css';

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

describe('MarkdownTable component', () => {
    test('it renders a table element', () => {
        const Component = () => {
            return (
                <MarkdownTable>
                    <tbody><tr><td>table</td></tr></tbody>
                </MarkdownTable>
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const markdownTables = Array.from(container.getElementsByClassName(styles.markdownTable));
        expect(markdownTables)
            .toEqual([expect.objectContaining({ tagName: 'TABLE', textContent: 'table' })]);
    });

    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return (
                    <MarkdownTable className={'test-class'}>
                        <tbody><tr><td>table</td></tr></tbody>
                    </MarkdownTable>
                );
            };
            act(() => {
                render(<Component />, { container });
            });
            const markdownTable = container.getElementsByClassName(styles.markdownTable)[0];
            expect(markdownTable.classList.contains('test-class')).toBe(true);
        });
    });
});
