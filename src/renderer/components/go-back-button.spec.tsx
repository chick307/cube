import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { FileSystem } from '../../common/entities/file-system';
import { immediate } from '../../common/utils/immediate';
import { EntryPath } from '../../common/values/entry-path';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import type { HistoryController } from '../controllers/history-controller';
import { HistoryStore } from '../stores/history-store';
import buttonStyles from './button.css';
import { GoBackButton } from './go-back-button';

class UnknownFileSystem extends FileSystem {
    //
}

const fileSystem1 = new UnknownFileSystem();

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

const dummyHistoryController: HistoryController = {
    goBack: () => {},
    goForward: () =>  {},
    navigate: () => {},
    replace: () => {},
};

afterEach(() => {
    jest.resetAllMocks();
});

describe('GoBackButton component', () => {
    test('it calls historyController.goBack() method when clicked', async () => {
        const goBack = jest.spyOn(dummyHistoryController, 'goBack');
        const historyStore = new HistoryStore({
            historyState: {
                entry: new DirectoryEntry(new EntryPath('/a')),
                fileSystem: fileSystem1,
            },
        });
        historyStore.push({
            entry: new DirectoryEntry(new EntryPath('/a/b')),
            fileSystem: fileSystem1,
        });
        await immediate();
        const Component = () => {
            return (
                <HistoryControllerProvider value={dummyHistoryController}>
                    <GoBackButton historyStore={historyStore} />
                </HistoryControllerProvider>
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goBack).toHaveBeenCalledTimes(1);
    });

    test('it does not call historyController.goBack() method if prevented default in onClick handler', async () => {
        const goBack = jest.spyOn(dummyHistoryController, 'goBack');
        const historyStore = new HistoryStore({
            historyState: {
                entry: new DirectoryEntry(new EntryPath('/a')),
                fileSystem: fileSystem1,
            },
        });
        historyStore.push({
            entry: new DirectoryEntry(new EntryPath('/a/b')),
            fileSystem: fileSystem1,
        });
        await immediate();
        const Component = () => {
            const onClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
                event.preventDefault();
            };
            return (
                <HistoryControllerProvider value={dummyHistoryController}>
                    <GoBackButton historyStore={historyStore} onClick={onClick} />
                </HistoryControllerProvider>
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(buttonStyles.button)[0]);
        expect(goBack).not.toHaveBeenCalled();
    });
});
