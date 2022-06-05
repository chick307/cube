import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { Entry } from '../../../common/entities/entry';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../../common/entities/history-item';
import { immediate } from '../../../common/utils/immediate';
import { State } from '../../../common/utils/restate';
import type { HistoryController, HistoryControllerState } from '../../controllers/history-controller';
import { ServicesProvider } from '../../hooks/use-service';
import { composeElements } from '../../utils/compose-elements';
import buttonStyles from '../button.module.css';
import { GoForwardButton } from './go-forward-button';

const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const fileSystem = new DummyFileSystem();
const historyItemA = new HistoryItem({ entry: entryA, fileSystem });

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

const createHistoryController = (params: {
    state?: State<HistoryControllerState>;
}): HistoryController => ({
    state: params.state ?? State.of({
        ableToGoBack: false,
        ableToGoForward: false,
        current: historyItemA,
    }),
    goBack: () => {},
    goForward: () => {},
    navigate: () => {},
    replace: () => {},
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('GoForwardButton component', () => {
    test('it calls historyController.goForward() method when clicked', async () => {
        const historyController = createHistoryController({
            state: State.of({
                ableToGoBack: false,
                ableToGoForward: true,
                current: historyItemA,
            }),
        });
        const goForward = jest.spyOn(historyController, 'goForward');
        await immediate();
        const services = { historyController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <GoForwardButton />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        fireEvent.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goForward).toHaveBeenCalledTimes(1);
    });

    test('it does not call historyController.goForward() method if prevented default in onClick handler', async () => {
        const historyController = createHistoryController({
            state: State.of({
                ableToGoBack: false,
                ableToGoForward: true,
                current: historyItemA,
            }),
        });
        const goForward = jest.spyOn(historyController, 'goForward');
        await immediate();
        const services = { historyController };
        const Component = () => {
            const onClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
                event.preventDefault();
            };
            return composeElements(
                <ServicesProvider value={services} />,
                <GoForwardButton onClick={onClick} />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        fireEvent.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goForward).not.toHaveBeenCalled();
    });
});
