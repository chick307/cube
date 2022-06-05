import { act, cleanup, render } from '@testing-library/react';

import { BinaryHeader } from './binary-header';
import styles from './binary-header.module.css';

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

describe('BinaryHeader component', () => {
    test('it renders a header from the code point', () => {
        const Component = () => {
            return (
                <BinaryHeader addressTextWidth={1} columnCount={1} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryHeaders = Array.from(container.getElementsByClassName(styles.binaryHeader));
        expect(binaryHeaders).toEqual([expect.objectContaining({ tagName: 'DIV' })]);
        const headerColumns = Array.from(container.getElementsByClassName(styles.headerColumn));
        expect(headerColumns).toMatchObject({ length: 16 });
    });

    test('it renders the column header for each column counts', () => {
        const Component = () => {
            return (
                <BinaryHeader addressTextWidth={1} columnCount={2} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryHeaders = Array.from(container.getElementsByClassName(styles.binaryHeader));
        expect(binaryHeaders).toEqual([expect.objectContaining({ tagName: 'DIV' })]);
        const headerColumns = Array.from(container.getElementsByClassName(styles.headerColumn));
        expect(headerColumns).toMatchObject({ length: 32 });
    });
});
