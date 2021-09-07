import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { ContextMenuServiceProvider } from '../../contexts/context-menu-service-context';
import { TabControllerProvider } from '../../contexts/tab-controller-context';
import { createTabController } from '../../controllers/tab-controller.test-helper';
import { createContextMenuService } from '../../hooks/use-context-menu.test-helper';
import { composeElements } from '../../utils/compose-elements';
import { TabContextMenu } from './tab-context-menu';

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

describe('TabContextMenu component', () => {
    test('it calls tabController.addTab() method when new tab menu clicked', async () => {
        const { clickContextMenuItem, contextMenuService } = createContextMenuService();
        const { tabController } = createTabController();
        const addTab = jest.spyOn(tabController, 'addTab');
        const Component = () => {
            return composeElements(
                <ContextMenuServiceProvider value={contextMenuService} />,
                <TabControllerProvider value={tabController} />,
                <TabContextMenu tabId={123} />,
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

    test('it calls tabController.removeTab() method when close menu clicked', async () => {
        const { clickContextMenuItem, contextMenuService } = createContextMenuService();
        const { tabController } = createTabController();
        const removeTab = jest.spyOn(tabController, 'removeTab');
        const Component = () => {
            return composeElements(
                <ContextMenuServiceProvider value={contextMenuService} />,
                <TabControllerProvider value={tabController} />,
                <TabContextMenu tabId={123} />,
                <div id="content" />,
            );
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        const content = document.querySelector('#content') as HTMLElement;
        clickContextMenuItem({ element: content, menuItemId: 'close' });
        expect(removeTab).toHaveBeenCalledTimes(1);
        expect(removeTab).toHaveBeenCalledWith({ id: 123 });
    });
});
