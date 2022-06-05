import { act, cleanup, render } from '@testing-library/react';

import { createTabController } from '../../controllers/tab-controller.test-helper';
import { createContextMenuService } from '../../hooks/use-context-menu.test-helper';
import { ServicesProvider } from '../../hooks/use-service';
import { composeElements } from '../../utils/compose-elements';
import { TabContextMenu } from './tab-context-menu';

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    cleanup();
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
        const services = { contextMenuService, tabController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TabContextMenu tabId={123} />,
                <div id="content" />,
            );
        };
        act(() => {
            render(<Component />, { container });
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
        const services = { contextMenuService, tabController };
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TabContextMenu tabId={123} />,
                <div id="content" />,
            );
        };
        act(() => {
            render(<Component />, { container });
        });
        const content = document.querySelector('#content') as HTMLElement;
        clickContextMenuItem({ element: content, menuItemId: 'close' });
        expect(removeTab).toHaveBeenCalledTimes(1);
        expect(removeTab).toHaveBeenCalledWith({ id: 123 });
    });
});
