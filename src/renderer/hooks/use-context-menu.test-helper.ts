import TestUtils from 'react-dom/test-utils';

import type { ContextMenuService, ContextMenuItemTemplate } from '../services/context-menu-service';

export const createContextMenuService = () => {
    const popupContextMenu = jest.fn();

    const contextMenuService: ContextMenuService = {
        popupContextMenu: (...args: any[]) => popupContextMenu(...args),
    };

    const clickContextMenuItem = (params: {
        element: HTMLElement;
        menuItemId: string;
    }) => {
        popupContextMenu.mockClear();
        TestUtils.Simulate.contextMenu(params.element);
        const getMenuItem = (menuItems: ContextMenuItemTemplate[]): ContextMenuItemTemplate | null => {
            for (const menuItem of menuItems) {
                if ('id' in menuItem && menuItem.id === params.menuItemId)
                    return menuItem;
                if ('submenu' in menuItem && Array.isArray(menuItem.submenu)) {
                    const item = getMenuItem(menuItem.submenu);
                    if (item !== null)
                        return item;
                }
            }
            return null;
        };
        const [[{ template = [] } = {}] = []] = popupContextMenu.mock.calls;
        const menuItem = getMenuItem(template);
        if (menuItem !== null && 'onClicked' in menuItem && typeof menuItem.onClicked === 'function')
            menuItem.onClicked();
    };

    return {
        clickContextMenuItem,
        contextMenuService,
    };
};
