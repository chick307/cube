import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { EventController } from '../../common/utils/event-controller';
import { KeyboardServiceProvider } from '../contexts/keyboard-service-context';
import { KeyboardService, KeyboardServiceEvent } from '../services/keyboard-service';
import { createKeyboardService } from '../services/keyboard-service.test-helper';
import { useKeyDown } from './use-key-down';

let container: HTMLElement;

let keyDownEventController: EventController<KeyboardServiceEvent>;

let keyboardService: KeyboardService;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    ({ keyDownEventController, keyboardService } = createKeyboardService());
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    keyDownEventController = null!;
    keyboardService = null!;
});

describe('useKeyDown() hook', () => {
    test('it adds listener of keydown events', async () => {
        const listener = jest.fn();
        const Component = () => {
            useKeyDown((e) => listener(e));
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render((
                <KeyboardServiceProvider value={keyboardService}>
                    <Component />
                </KeyboardServiceProvider>
            ), container);
        });
        expect(listener).not.toHaveBeenCalled();
        const event = { key: 'A' };
        keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(event);
    });

    test('it updates listener when dependencies changed', async () => {
        const listener = jest.fn();
        const Component = (props: {
            value: number;
        }) => {
            useKeyDown((event) => listener(props.value, event), [props.value]);
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render((
                <KeyboardServiceProvider value={keyboardService}>
                    <Component value={0} />
                </KeyboardServiceProvider>
            ), container);
        });
        expect(listener).not.toHaveBeenCalled();
        const event = { key: 'A' };
        keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(0, event);
        listener.mockClear();
        TestUtils.act(() => {
            ReactDom.render((
                <KeyboardServiceProvider value={keyboardService}>
                    <Component value={123} />
                </KeyboardServiceProvider>
            ), container);
        });
        expect(listener).not.toHaveBeenCalled();
        keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(123, event);
    });

    test('it does nothing if keyboard service is not provided', async () => {
        const listener = jest.fn();
        const Component = (props: {
            value: number;
        }) => {
            useKeyDown(() => {
                listener(props.value);
            }, [props.value]);
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render(<Component value={0} />, container);
        });
        expect(listener).not.toHaveBeenCalled();
        const event = { key: 'A' };
        keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).not.toHaveBeenCalled();
        TestUtils.act(() => {
            ReactDom.render(<Component value={123} />, container);
        });
        expect(listener).not.toHaveBeenCalled();
        keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).not.toHaveBeenCalled();
    });
});
