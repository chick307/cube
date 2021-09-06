import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { TabController } from '../controllers/tab-controller';
import { createTabController } from '../controllers/tab-controller.test-helper';
import { composeElements } from '../utils/compose-elements';
import { TabControllerProvider, useTabController } from './tab-controller-context';

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

describe('TabController context', () => {
    describe('TabControllerProvider component', () => {
        test('it provides a TabController instance', () => {
            let instance: TabController | null = null;

            const Component = () => {
                const tabController = useTabController();
                instance = tabController;
                return <></>;
            };

            const { tabController } = createTabController();

            TestUtils.act(() => {
                ReactDom.render(composeElements(
                    <TabControllerProvider value={tabController}/>,
                    <Component />,
                ), container);
            });

            expect(instance).toBe(tabController);
        });
    });

    describe('useTabController hook', () => {
        test('it throws an error if TabController instance is not provided', () => {
            const handleError = jest.fn();
            const Component = () => {
                try {
                    useTabController();
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
