import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { useGateway } from './use-gateway';

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
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
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
        TestUtils.act(() => {
            ReactDom.render(<Component enabled={true} />, container);
        });
        expect(container.textContent).toBe('ABC');
        TestUtils.act(() => {
            ReactDom.render(<Component enabled={false} />, container);
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
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
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
        TestUtils.act(() => {
            ReactDom.render(<Component content={'X'} />, container);
        });
        expect(container.textContent).toBe('ACXD');
        TestUtils.act(() => {
            ReactDom.render(<Component content={'Y'} />, container);
        });
        expect(container.textContent).toBe('ACYD');
        TestUtils.act(() => {
            ReactDom.render(<Component content={'Z'} />, container);
        });
        expect(container.textContent).toBe('ACZD');
    });
});
