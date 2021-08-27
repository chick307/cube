import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { LocalFileSystem } from '../../common/entities';
import { Entry } from '../../common/entities/entry';
import { State } from '../../common/utils/restate';
import { HistoryController } from '../controllers/history-controller';
import { composeElements } from '../utils/compose-elements';
import { HistoryControllerProvider, useHistoryController } from './history-controller-context';

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

describe('HistoryController context', () => {
    describe('HistoryControllerProvider component', () => {
        test('it provides a HistoryController instance', () => {
            let instance: HistoryController | null = null;

            const Component = () => {
                const historyController = useHistoryController();
                instance = historyController;
                return <></>;
            };

            const historyControllerInstance: HistoryController = {
                state: State.of({
                    ableToGoBack: false,
                    ableToGoForward: false,
                    current: {
                        entry: Entry.fromJson({ type: 'directory', path: '/a' }),
                        fileSystem: new LocalFileSystem(),
                    },
                }),
                goBack: () => {},
                goForward: () => {},
                navigate: () => {},
                replace: () => {},
            };

            TestUtils.act(() => {
                ReactDom.render(composeElements(
                    <HistoryControllerProvider value={historyControllerInstance}/>,
                    <Component />,
                ), container);
            });

            expect(instance).toBe(historyControllerInstance);
        });
    });

    describe('useHistoryController hook', () => {
        test('it throws an error if HistoryController instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useHistoryController();
                } catch (e) {
                    handleError(e);
                }
                return <></>;
            };

            TestUtils.act(() => {
                ReactDom.render((
                    <Component />
                ), container);
            });

            expect(handleError).toHaveBeenCalledTimes(1);
        });
    });
});
