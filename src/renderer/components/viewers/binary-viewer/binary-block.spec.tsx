import { act, cleanup, render } from '@testing-library/react';

import { BinaryViewerControllerBlockState } from '../../../viewer-controllers/binary-viewer-controller';
import { BinaryBlock } from './binary-block';
import styles from './binary-block.module.css';

const bufferA = Buffer.from([0, 1, 2, 3, 4]);

const blockA: BinaryViewerControllerBlockState = {
    blockEnd: 5,
    blockStart: 0,
    codePoints: [0, 1, 2, 3, 4],
    id: 'block-a',
};

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

describe('BinaryBlock component', () => {
    test('it renders a block', () => {
        const Component = () => {
            return (
                <BinaryBlock addressTextWidth={1} block={blockA} buffer={bufferA} columnCount={1} visible={true} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryBlocks = Array.from(container.getElementsByClassName(styles.binaryBlock));
        expect(binaryBlocks).toEqual([expect.objectContaining({ tagName: 'DIV' })]);
        const bytes = Array.from(container.getElementsByClassName(styles.byte));
        expect(bytes.length).toBe(16);
        expect(bytes.filter(({ textContent }) => textContent !== '').length).toBe(5);
    });

    test('it renders a empty element if visible property is false', () => {
        const Component = () => {
            return (
                <BinaryBlock addressTextWidth={1} block={blockA} buffer={bufferA} columnCount={1} visible={false} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryBlocks = Array.from(container.getElementsByClassName(styles.binaryBlock));
        expect(binaryBlocks).toEqual([expect.objectContaining({ tagName: 'DIV' })]);
        const bytes = Array.from(container.getElementsByClassName(styles.byte));
        expect(bytes.length).toBe(0);
    });


    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return (
                    <BinaryBlock className={'test-class'}
                        addressTextWidth={1} block={blockA} buffer={bufferA} columnCount={1} visible={true} />
                );
            };
            act(() => {
                render(<Component />, { container });
            });
            const binaryBlock = container.getElementsByClassName(styles.binaryBlock)[0];
            expect(binaryBlock.classList.contains('test-class')).toBe(true);
        });
    });
});
