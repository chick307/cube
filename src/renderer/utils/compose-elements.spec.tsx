import { act, cleanup, render } from '@testing-library/react';
import React from 'react';

import { composeElements } from './compose-elements';

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

const Context1 = React.createContext<{ a: number; }>({ a: 0 });
const Context2 = React.createContext<{ b: number; }>({ b: 0 });
const Context3 = React.createContext<{ c: number; }>({ c: 0 });

describe('composeElements() function', () => {
    test('it composes elements', () => {
        const Component = () => {
            return composeElements(
                <div className={'a'} />,
                <div className={'b'} />,
                <div className={'c'} />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        expect((container.firstChild as HTMLElement)?.className).toBe('a');
        expect((container.firstChild?.firstChild as HTMLElement)?.className).toBe('b');
        expect((container.firstChild?.firstChild?.firstChild as HTMLElement)?.className).toBe('c');
    });

    test('it composes providers', () => {
        let a = 0;
        let b = 0;
        let c = 0;
        const InnerComponent = () => {
            a = React.useContext(Context1).a;
            b = React.useContext(Context2).b;
            c = React.useContext(Context3).c;
            return <></>;
        };
        const Component = () => {
            return composeElements(
                <Context1.Provider value={{ a: 1 }} />,
                <Context2.Provider value={{ b: 2 }} />,
                <Context3.Provider value={{ c: 3 }} />,
                <InnerComponent />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
    });
});
