import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { createTabController } from '../../controllers/tab-controller.test-helper';
import { ServicesProvider } from '../../hooks/use-service';
import { composeElements } from '../../utils/compose-elements';
import { TabAddButton } from './tab-add-button';
import styles from './tab-add-button.module.css';

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
        const services = { tabController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
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
