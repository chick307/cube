import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import type { KeyboardService } from '../services/keyboard-service';
import { createKeyboardService } from '../services/keyboard-service.test-helper';
import { KeyboardServiceProvider, useKeyboardService } from './keyboard-service-context';

let container: HTMLElement;

let keyboardService: KeyboardService;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    ({ keyboardService } = createKeyboardService());
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    keyboardService = null!;
});

describe('KeyboardService context', () => {
    describe('KeyboardServiceProvider component', () => {
        test('it provides a KeyboardService instance', () => {
            let instance: KeyboardService | null = null;
            const Component = () => {
                instance = useKeyboardService();
                return <></>;
            };
            TestUtils.act(() => {
                ReactDom.render((
                    <KeyboardServiceProvider value={keyboardService}>
                        <Component />
                    </KeyboardServiceProvider>
                ), container);
            });
            expect(instance).toBe(keyboardService);
        });
    });

    describe('useKeyboardService hook', () => {
        test('it returns null if KeyboardService instance is not provided', () => {
            let instance: KeyboardService | null | undefined = undefined;
            const Component = () => {
                instance = useKeyboardService();
                return <></>;
            };
            TestUtils.act(() => {
                ReactDom.render((
                    <Component />
                ), container);
            });
            expect(instance).toBeNull();
        });
    });
});
