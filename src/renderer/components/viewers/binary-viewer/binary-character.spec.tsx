import { act, cleanup, render } from '@testing-library/react';

import { BinaryCharacter } from './binary-character';
import styles from './binary-character.module.css';

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

describe('BinaryCharacter component', () => {
    test('it renders a character from the code point', () => {
        const Component = () => {
            return (
                <BinaryCharacter codePoint={0x61} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryCharacters = Array.from(container.getElementsByClassName(styles.binaryCharacter));
        expect(binaryCharacters).toEqual([expect.objectContaining({ tagName: 'DIV', textContent: 'a' })]);
    });

    test('it renders the symbol character if the code point is control character', () => {
        const Component = (props: { codePoint: number; }) => {
            return (
                <BinaryCharacter codePoint={props.codePoint} />
            );
        };
        act(() => {
            render(<Component codePoint={0x00} />, { container });
        });
        const binaryCharacters = Array.from(container.getElementsByClassName(styles.binaryCharacter));
        expect(binaryCharacters).toEqual([expect.objectContaining({ tagName: 'DIV', textContent: '\u2400' })]);
        act(() => {
            render(<Component codePoint={0x7F} />, { container });
        });
        expect(binaryCharacters).toEqual([expect.objectContaining({ tagName: 'DIV', textContent: '\u2421' })]);
    });

    test('it renders the replacement character if the code point is not passed', () => {
        const Component = () => {
            return (
                <BinaryCharacter codePoint={null} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryCharacters = Array.from(container.getElementsByClassName(styles.binaryCharacter));
        expect(binaryCharacters).toEqual([expect.objectContaining({ tagName: 'DIV', textContent: '\uFFFD' })]);
    });

    test('it renders the replacement character if the code point is invalid', () => {
        const Component = () => {
            return (
                <BinaryCharacter codePoint={1929671} />
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const binaryCharacters = Array.from(container.getElementsByClassName(styles.binaryCharacter));
        expect(binaryCharacters).toEqual([expect.objectContaining({ tagName: 'DIV', textContent: '\uFFFD' })]);
    });

    describe('className property', () => {
        test('it sets a class name to the component', () => {
            const Component = () => {
                return (
                    <BinaryCharacter className={'test-class'} codePoint={null} />
                );
            };
            act(() => {
                render(<Component />, { container });
            });
            const binaryCharacter = container.getElementsByClassName(styles.binaryCharacter)[0];
            expect(binaryCharacter.classList.contains('test-class')).toBe(true);
        });
    });
});
