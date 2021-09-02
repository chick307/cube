import { EventController } from '../../common/utils/event-controller';
import { ContextMenuServiceImpl } from './context-menu-service';
import type { MainChannelService } from './main-channel-service';

describe('ContextMenuService type', () => {
    describe('contextMenuService.popupContextMenu() method', () => {
        test('it sends a message for context menus', async () => {
            const onMessageController = new EventController();
            const postMessage = jest.fn();
            const mainChannelService = { onMessage: onMessageController.signal, postMessage } as MainChannelService;
            const contextMenuService = new ContextMenuServiceImpl({ mainChannelService });
            {
                contextMenuService.popupContextMenu({
                    template: [{ label: 'A' }],
                    x: 123,
                    y: 456,
                });
                await Promise.resolve();
                expect(postMessage).toHaveBeenCalledTimes(1);
                const message = postMessage.mock.calls[0][0];
                expect(message.type).toBe('window.context-menu');
                expect(typeof message.menuId).toBe('string');
                expect(message.x).toBe(123);
                expect(message.y).toBe(456);
                expect(message.template).toEqual([
                    { type: 'normal', label: 'A', enabled: true, visible: true },
                ]);
                onMessageController.emit({ type: 'window.context-menu-closed', menuId: message.menuId });
                await Promise.resolve();
                postMessage.mockClear();
            }
            {
                contextMenuService.popupContextMenu({
                    template: [
                        {
                            type: 'submenu',
                            label: 'B',
                            submenu: [
                                { type: 'normal', label: 'C', enabled: undefined, visible: undefined },
                            ],
                        },
                        { type: 'separator' },
                        {
                            label: 'D',
                            submenu: [
                                { type: 'checkbox', label: 'E', enabled: false, visible: true, checked: true },
                                { type: 'checkbox', label: 'F', enabled: true, visible: false },
                            ],
                        },
                    ],
                    x: 123,
                    y: 456,
                });
                await Promise.resolve();
                expect(postMessage).toHaveBeenCalledTimes(1);
                const message = postMessage.mock.calls[0][0];
                expect(message.type).toBe('window.context-menu');
                expect(typeof message.menuId).toBe('string');
                expect(message.x).toBe(123);
                expect(message.y).toBe(456);
                expect(message.template).toEqual([
                    {
                        type: 'submenu',
                        label: 'B',
                        submenu: [
                            { type: 'normal', label: 'C', enabled: true, visible: true },
                        ],
                        enabled: true,
                        visible: true,
                    },
                    { type: 'separator' },
                    {
                        type: 'submenu',
                        label: 'D',
                        submenu: [
                            { type: 'checkbox', label: 'E', enabled: false, visible: true, checked: true },
                            { type: 'checkbox', label: 'F', enabled: true, visible: false, checked: false },
                        ],
                        enabled: true,
                        visible: true,
                    },
                ]);
                onMessageController.emit({ type: 'window.context-menu-closed', menuId: message.menuId });
                await Promise.resolve();
                postMessage.mockClear();
            }
        });

        test('it adds click handlers', async () => {
            const onMessageController = new EventController();
            const postMessage = jest.fn();
            const mainChannelService = { onMessage: onMessageController.signal, postMessage } as MainChannelService;
            const contextMenuService = new ContextMenuServiceImpl({ mainChannelService });
            {
                const onClicked = jest.fn();
                contextMenuService.popupContextMenu({ template: [{ label: 'A', onClicked }], x: 123, y: 456 });
                await Promise.resolve();
                expect(postMessage).toHaveBeenCalledTimes(1);
                const message = postMessage.mock.calls[0][0];
                const { menuId } = message;
                const menuItemId = message.template[0].id;
                onMessageController.emit({ type: 'window.context-menu-clicked', menuId, menuItemId });
                onMessageController.emit({ type: 'window.context-menu-closed', menuId });
                await Promise.resolve();
                expect(onClicked).toHaveBeenCalledTimes(1);
                postMessage.mockClear();
                onClicked.mockClear();
            }
            {
                const onClicked = jest.fn();
                contextMenuService.popupContextMenu({ template: [{ label: 'B', onClicked }], x: 123, y: 456 });
                await Promise.resolve();
                expect(postMessage).toHaveBeenCalledTimes(1);
                const message = postMessage.mock.calls[0][0];
                const { menuId } = message;
                const menuItemId = message.template[0].id;
                onMessageController.emit({ type: 'window.context-menu-closed', menuId });
                onMessageController.emit({ type: 'window.context-menu-clicked', menuId, menuItemId });
                await Promise.resolve();
                expect(onClicked).not.toHaveBeenCalled();
                postMessage.mockClear();
                onClicked.mockClear();
            }
            {
                const onClicked = jest.fn();
                contextMenuService.popupContextMenu({ template: [{ label: 'C', onClicked }], x: 123, y: 456 });
                await Promise.resolve();
                expect(postMessage).toHaveBeenCalledTimes(1);
                const message = postMessage.mock.calls[0][0];
                const { menuId } = message;
                const menuItemId = 'non-exist-menu-item-id';
                onMessageController.emit({ type: 'window.context-menu-clicked', menuId, menuItemId });
                onMessageController.emit({ type: 'window.context-menu-closed', menuId });
                await Promise.resolve();
                expect(onClicked).not.toHaveBeenCalled();
                postMessage.mockClear();
                onClicked.mockClear();
            }
        });
    });
});
