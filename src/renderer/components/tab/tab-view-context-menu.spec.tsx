import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { createTabController } from '../../controllers/tab-controller.test-helper';
import { createContextMenuService } from '../../hooks/use-context-menu.test-helper';
import { ServicesProvider } from '../../hooks/use-service';
import { composeElements } from '../../utils/compose-elements';
import { TabViewContextMenu } from './tab-view-context-menu';

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

describe('TabViewContextMenu component', () => {
    test('it calls tabController.addTab() method when new tab menu clicked', async () => {
        const { clickContextMenuItem, contextMenuService } = createContextMenuService();
        const { tabController } = createTabController();
        const addTab = jest.spyOn(tabController, 'addTab');
        const services = { contextMenuService, tabController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TabViewContextMenu />,
                <div id="content" />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        const content = document.querySelector('#content') as HTMLElement;
        clickContextMenuItem({ element: content, menuItemId: 'new-tab' });
        expect(addTab).toHaveBeenCalledTimes(1);
        expect(addTab).toHaveBeenCalledWith({ active: true });
    });
});
