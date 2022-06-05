import { act, cleanup, render } from '@testing-library/react';

import type { EventController } from '../../common/utils/event-controller';
import type { KeyboardService, KeyboardServiceEvent } from '../services/keyboard-service';
import { createKeyboardService } from '../services/keyboard-service.test-helper';
import { composeElements } from '../utils/compose-elements';
import { useKeyDown } from './use-key-down';
import { ServiceProvider, ServicesProvider } from './use-service';

let container: HTMLElement;

let controllers: {
    keyDownEventController: EventController<KeyboardServiceEvent>;
};

let services: {
    keyboardService: KeyboardService;
};

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const { keyDownEventController, keyboardService } = createKeyboardService();

    controllers = {
        keyDownEventController,
    };

    services = {
        keyboardService,
    };
});

afterEach(() => {
    cleanup();
    container.remove();
    container = null!;

    controllers = null!;
    services = null!;
});

describe('useKeyDown() hook', () => {
    test('it adds listener of keydown events', async () => {
        const listener = jest.fn();
        const Component = () => {
            useKeyDown((e) => listener(e));
            return <></>;
        };
        act(() => {
            render(composeElements(
                <ServicesProvider value={services} />,
                <Component />,
            ), { container });
        });
        expect(listener).not.toHaveBeenCalled();
        const event = { key: 'A' };
        controllers.keyDownEventController.emit(event);
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
        act(() => {
            render(composeElements(
                <ServicesProvider value={services} />,
                <Component value={0} />,
            ), { container });
        });
        expect(listener).not.toHaveBeenCalled();
        const event = { key: 'A' };
        controllers.keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(0, event);
        listener.mockClear();
        act(() => {
            render(composeElements(
                <ServicesProvider value={services} />,
                <Component value={123} />,
            ), { container });
        });
        expect(listener).not.toHaveBeenCalled();
        controllers.keyDownEventController.emit(event);
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
        act(() => {
            render(composeElements(
                <ServiceProvider name="keyboardService" value={null} />,
                <Component value={0} />,
            ), { container });
        });
        expect(listener).not.toHaveBeenCalled();
        const event = { key: 'A' };
        controllers.keyDownEventController.emit(event);
        await Promise.resolve();
        expect(listener).not.toHaveBeenCalled();
    });
});
