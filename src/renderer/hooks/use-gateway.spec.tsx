import { act, cleanup, render } from '@testing-library/react';

import { useGateway } from './use-gateway';

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

describe('useGateway() hook', () => {
    test('it returns gateway components', () => {
        const Component = () => {
            const gateway = useGateway();
            return (
                <>
                    A
                    <div>
                        B
                        <gateway.Gateway>
                            C
                            <div>
                                D
                            </div>
                            E
                        </gateway.Gateway>
                        F
                    </div>
                    G
                    <div>
                        H
                        <gateway.Exit />
                        I
                    </div>
                    J
                </>
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        expect(container.textContent).toBe('ABFGHCDEIJ');
    });

    test('Gateway component cleans up after unmounted', () => {
        const Component = (props: { enabled: boolean; }) => {
            const gateway = useGateway();
            return (
                <>
                    {props.enabled ? <gateway.Gateway>ABC</gateway.Gateway> : null}
                    <gateway.Exit />
                </>
            );
        };
        act(() => {
            render(<Component enabled={true} />, { container });
        });
        expect(container.textContent).toBe('ABC');
        act(() => {
            render(<Component enabled={false} />, { container });
        });
        expect(container.textContent).toBe('');
    });

    test('Gateway components can be nested', () => {
        const Component = () => {
            const outer = useGateway();
            const inner = useGateway();
            return (
                <>
                    A
                    <outer.Gateway>
                        B
                        <inner.Exit />
                        C
                    </outer.Gateway>
                    D
                    <inner.Gateway>
                        E
                    </inner.Gateway>
                    F
                    <outer.Exit />
                    G
                </>
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        expect(container.textContent).toBe('ADFBECG');
    });

    test('Exit component follows the updates of contents in Gateway component', () => {
        const Component = (props: { content: React.ReactNode; }) => {
            const { Exit, Gateway } = useGateway();
            return (
                <>
                    A
                    <Gateway>
                        {props.content}
                    </Gateway>
                    C
                    <Exit />
                    D
                </>
            );
        };
        act(() => {
            render(<Component content={'X'} />, { container });
        });
        expect(container.textContent).toBe('ACXD');
        act(() => {
            render(<Component content={'Y'} />, { container });
        });
        expect(container.textContent).toBe('ACYD');
        act(() => {
            render(<Component content={'Z'} />, { container });
        });
        expect(container.textContent).toBe('ACZD');
    });
});
