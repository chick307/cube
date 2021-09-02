import type { MenuItemConstructorOptions } from 'electron';

import type { MainChannelService } from './main-channel-service';

export type ContextMenuService = {
    popupContextMenu(params: PopupContextMenuParameters): void;
};

export type PopupContextMenuParameters = {
    template: ContextMenuItemTemplate[];
    x: number;
    y: number;
};

export type ContextMenuItemTemplate = (
    | {
        type?: 'normal';
        id?: string;
        label: string;
        enabled?: boolean;
        onClicked?: () => void;
        visible?: boolean;
    }
    | {
        type: 'separator';
    }
    | {
        type?: 'submenu';
        id?: string;
        label: string;
        submenu: ContextMenuItemTemplate[];
        enabled?: boolean;
        visible?: boolean;
    }
    | {
        type: 'checkbox';
        id?: string;
        label: string;
        checked?: boolean;
        enabled?: boolean;
        onClicked?: () => void;
        visible?: boolean;
    }
    | {
        label: string;
        id?: string;
        checked: boolean;
        enabled?: boolean;
        onClicked?: () => void;
        visible?: boolean;
    }
);

export class ContextMenuServiceImpl implements ContextMenuService {
    #contextMenuIdCounter = 0;

    #clickHandlers = {} as {
        [menuId: string]: ((menuItemId: string) => void) | undefined;
    };

    #mainChannelService: MainChannelService;

    constructor(params: {
        mainChannelService: MainChannelService;
    }) {
        this.#mainChannelService = params.mainChannelService;

        this.#mainChannelService.onMessage.addListener((message) => {
            switch (message.type) {
                case 'window.context-menu-closed': {
                    delete this.#clickHandlers[message.menuId];
                    return;
                }

                case 'window.context-menu-clicked': {
                    const handler = this.#clickHandlers[message.menuId];
                    if (handler != null)
                        handler(message.menuItemId);
                    return;
                }
            }
        });
    }

    popupContextMenu(params: PopupContextMenuParameters): void {
        const menuId = `menu-${this.#contextMenuIdCounter++}`;
        let idCounter = 0;
        const handlers = {} as { [menuItemId: string]: (() => void) | undefined; };
        const getId = (t: ContextMenuItemTemplate) => {
            if ('onClicked' in t && typeof t.onClicked === 'function') {
                const id = `menu-item-${++idCounter}`;
                handlers[id] = t.onClicked;
                return id;
            }
        };
        const isEnabled = (t: ContextMenuItemTemplate) => 'enabled' in t ? t.enabled == null || t.enabled : true;
        const isVisible = (t: ContextMenuItemTemplate) => 'visible' in t ? t.visible == null || t.visible : true;
        const convert = (t: ContextMenuItemTemplate): import('electron').MenuItemConstructorOptions => {
            if ('type' in t && t.type === 'separator') {
                return { type: 'separator' };
            }
            if ('submenu' in t) {
                return {
                    type: 'submenu',
                    label: t.label,
                    enabled: isEnabled(t),
                    submenu: t.submenu.map(convert),
                    visible: isVisible(t),
                };
            }
            const id = getId(t);
            if ('checked' in t || t.type === 'checkbox') {
                return {
                    type: 'checkbox',
                    label: t.label,
                    checked: !!t.checked,
                    enabled: isEnabled(t),
                    visible: isVisible(t),
                    id,
                };
            }
            return {
                type: 'normal',
                label: t.label,
                enabled: isEnabled(t),
                visible: isVisible(t),
                id,
            };
        };
        const template = params.template.map(convert);
        this.#clickHandlers[menuId] = (menuItemId) => {
            const handler = handlers[menuItemId];
            if (handler != null)
                handler();
        };
        this.#mainChannelService.postMessage({
            type: 'window.context-menu',
            menuId,
            template,
            x: params.x,
            y: params.y,
        });
    }
}

declare module './main-channel-service' {
    interface MainChannelIncomingMessages {
        'window.context-menu-closed': {
            type: 'window.context-menu-closed';
            menuId: string;
        };

        'window.context-menu-clicked': {
            type: 'window.context-menu-clicked';
            menuId: string;
            menuItemId: string;
        };
    }

    interface MainChannelOutgoingMessages {
        'window.context-menu': {
            type: 'window.context-menu';
            menuId: string;
            template: MenuItemConstructorOptions[];
            x: number;
            y: number;
        };
    }
}
