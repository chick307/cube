import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { Entry, FileSystem } from '../../common/entities';
import { immediate } from '../../common/utils/immediate';
import { State } from '../../common/utils/restate';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import type { HistoryController } from '../controllers/history-controller';
import { HistoryStore } from '../stores/history-store';
import { composeElements } from '../utils/compose-elements';
import buttonStyles from './button.css';
import { GoBackButton } from './go-back-button';

class UnknownFileSystem extends FileSystem {}
const unknownFileSystem = new UnknownFileSystem();
const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const entryB = Entry.fromJson({ type: 'directory', path: '/a/b' });
const historyStateA = { entry: entryA, fileSystem: unknownFileSystem };
const historyStateB = { entry: entryB, fileSystem: unknownFileSystem };

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

const createHistoryStore = () => {
    return new HistoryStore({
        historyState: historyStateA,
    });
};

const createHistoryController = (params: {
    historyStore?: HistoryStore;
}): HistoryController => ({
    historyStore: params.historyStore ?? createHistoryStore(),
    state: State.of({
        ableToGoBack: false,
        ableToGoForward: false,
        backHistories: [],
        current: historyStateA,
        forwardHistories: [],
    }),
    goBack: () => {},
    goForward: () => {},
    navigate: () => {},
    replace: () => {},
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('GoBackButton component', () => {
    test('it calls historyController.goBack() method when clicked', async () => {
        const historyStore = createHistoryStore();
        const historyController = createHistoryController({ historyStore });
        const goBack = jest.spyOn(historyController, 'goBack');
        historyStore.push(historyStateB);
        await immediate();
        const Component = () => {
            return composeElements(
                <HistoryControllerProvider value={historyController} />,
                <GoBackButton />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goBack).toHaveBeenCalledTimes(1);
    });

    test('it does not call historyController.goBack() method if prevented default in onClick handler', async () => {
        const historyStore = createHistoryStore();
        const historyController = createHistoryController({ historyStore });
        const goBack = jest.spyOn(historyController, 'goBack');
        historyStore.push(historyStateB);
        await immediate();
        const Component = () => {
            const onClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
                event.preventDefault();
            };
            return composeElements(
                <HistoryControllerProvider value={historyController} />,
                <GoBackButton onClick={onClick} />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goBack).not.toHaveBeenCalled();
    });
});
