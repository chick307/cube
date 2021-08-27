import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { FileSystem } from '../../common/entities';
import { Entry } from '../../common/entities/entry';
import { immediate } from '../../common/utils/immediate';
import { State } from '../../common/utils/restate';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import type { HistoryController, HistoryControllerState } from '../controllers/history-controller';
import { composeElements } from '../utils/compose-elements';
import buttonStyles from './button.css';
import { GoBackButton } from './go-back-button';

class UnknownFileSystem extends FileSystem {}
const unknownFileSystem = new UnknownFileSystem();
const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const entryB = Entry.fromJson({ type: 'directory', path: '/a/b' });
const historyItemA = { entry: entryA, fileSystem: unknownFileSystem };
const historyItemB = { entry: entryB, fileSystem: unknownFileSystem };

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

describe('GoBackButton component', () => {
    test('it calls historyController.goBack() method when clicked', async () => {
        const historyController = createHistoryController({
            state: State.of({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemB,
            }),
        });
        const goBack = jest.spyOn(historyController, 'goBack');
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
        const historyController = createHistoryController({
            state: State.of({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemB,
            }),
        });
        const goBack = jest.spyOn(historyController, 'goBack');
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
