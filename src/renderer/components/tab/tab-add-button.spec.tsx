import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { TabControllerProvider } from '../../contexts/tab-controller-context';
import { createTabController } from '../../controllers/tab-controller.test-helper';
import { composeElements } from '../../utils/compose-elements';
import styles from './tab-add-button.css';
import { TabAddButton } from './tab-add-button';

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

afterEach(() => {
    jest.resetAllMocks();
});

describe('TabAddButton component', () => {
    test('it calls tabContoller.addTab() method when clicked', async () => {
        const { tabController } = createTabController();
        const addTab = jest.spyOn(tabController, 'addTab');
        const Component = () => {
            return composeElements(
                <TabControllerProvider value={tabController} />,
                <TabAddButton />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        TestUtils.Simulate.click(container.getElementsByClassName(styles.tabAddButton)[0]);
        expect(addTab).toHaveBeenCalledTimes(1);
        expect(addTab).toHaveBeenCalledWith({ active: true });
    });
});
