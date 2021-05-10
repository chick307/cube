import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { HistoryController } from '../controllers/history-controller';
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
                goBack: () => {},
                goForward: () => {},
                navigate: () => {},
                replace: () => {},
            };

            TestUtils.act(() => {
                ReactDom.render((
                    <HistoryControllerProvider value={historyControllerInstance}>
                        <Component />
                    </HistoryControllerProvider>
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
                } catch(e) {
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
