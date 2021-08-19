import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { Entry } from '../../common/entities';

import { FileSystem } from '../../common/entities/file-system';
import { immediate } from '../../common/utils/immediate';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import type { HistoryController } from '../controllers/history-controller';
import { HistoryStore } from '../stores/history-store';
import { composeElements } from '../utils/compose-elements';
import buttonStyles from './button.css';
import { GoForwardButton } from './go-forward-button';

class UnknownFileSystem extends FileSystem {}
const unknownFileSystem = new UnknownFileSystem();

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
        historyState: {
            entry: Entry.fromJson({ type: 'directory', path: '/a' }),
            fileSystem: unknownFileSystem,
        },
    });
};

const createHistoryController = (params: {
    historyStore?: HistoryStore;
}): HistoryController => ({
    historyStore: params.historyStore ?? createHistoryStore(),
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
        const historyStore = createHistoryStore();
        const historyController = createHistoryController({ historyStore });
        const goForward = jest.spyOn(historyController, 'goForward');
        historyStore.push({
            entry: Entry.fromJson({ type: 'directory', path: '/a/b' }),
            fileSystem: unknownFileSystem,
        });
        historyStore.shiftBack();
        await immediate();
        const Component = () => {
            return composeElements(
                <HistoryControllerProvider value={historyController} />,
                <GoForwardButton />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goForward).toHaveBeenCalledTimes(1);
    });

    test('it does not call historyController.goForward() method if prevented default in onClick handler', async () => {
        const historyStore = createHistoryStore();
        const historyController = createHistoryController({ historyStore });
        const goForward = jest.spyOn(historyController, 'goForward');
        historyStore.push({
            entry: Entry.fromJson({ type: 'directory', path: '/a/b' }),
            fileSystem: unknownFileSystem,
        });
        historyStore.shiftBack();
        await immediate();
        const Component = () => {
            const onClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
                event.preventDefault();
            };
            return composeElements(
                <HistoryControllerProvider value={historyController} />,
                <GoForwardButton onClick={onClick} />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goForward).not.toHaveBeenCalled();
    });
});
