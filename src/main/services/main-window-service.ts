import * as path from 'path';

import { BrowserWindow, Menu, MenuItemConstructorOptions, MessageChannelMain, app } from 'electron';

import { DirectoryEntry } from '../../common/entities/entry';
import { LocalFileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { EventController, EventSignal } from '../../common/utils/event-controller';
import { EntryPath } from '../../common/values/entry-path';
import type { RestoreWindowStateService } from './restore-window-state-service';

const MAIN_WINDOW_URL = `file://${path.resolve(__dirname, '../views/main-window.html')}`;

export type CloseEvent = {
    type: 'close';
};

export type OpenEvent = {
    type: 'open';
};

export type MainWindowService = {
    readonly ableToGoBack: boolean;

    readonly ableToGoForward: boolean;

    onClose: EventSignal<CloseEvent>;

    readonly onHistoryStateChanged: EventSignal<HistoryStateChangedEvent>;

    onOpen: EventSignal<OpenEvent>;

    activate(): void;

    addTab(): void;

    close(): void;

    closeTab(): void;

    goBack(): void;

    goForward(): void;

    isOpen(): boolean;

    openFile(params: {
        historyItem: HistoryItem;
    }): void;

    selectNextTab(): void;

    selectPreviousTab(): void;

    toggleDevTools(): void;
};

export type HistoryStateChangedEvent = {
    type: 'history-state-changed';
};

const defaultHistoryItem = new HistoryItem({
    entry: new DirectoryEntry(new EntryPath(app.getPath('home'))),
    fileSystem: new LocalFileSystem(),
});

export class MainWindowServiceImpl implements MainWindowService {
    #historyState = {
        ableToGoBack: false,
        ableToGoForward: false,
    };

    #onHistoryStateChangedController = new EventController<HistoryStateChangedEvent>();

    private _onCloseController: EventController<CloseEvent>;

    private _onOpenController: EventController<OpenEvent>;

    private _restoreWindowStateService: RestoreWindowStateService;

    private _controller: {
        close(): void;
        postMessage(message: unknown): void;
        show(): void;
        toggleDevTools(): void;
    } | null = null;

    readonly onClose: EventSignal<CloseEvent>;

    get onHistoryStateChanged(): EventSignal<HistoryStateChangedEvent> {
        return this.#onHistoryStateChangedController.signal;
    }

    readonly onOpen: EventSignal<OpenEvent>;

    constructor(params: {
        restoreWindowStateService: RestoreWindowStateService;
    }) {
        this._onCloseController = new EventController<CloseEvent>();
        this._onOpenController = new EventController<OpenEvent>();
        this._restoreWindowStateService = params.restoreWindowStateService;
        this.onClose = this._onCloseController.signal;
        this.onOpen = this._onOpenController.signal;
    }

    get ableToGoBack() {
        return this.#historyState.ableToGoBack;
    }

    get ableToGoForward() {
        return this.#historyState.ableToGoForward;
    }

    private async _createWindow(params: {
        initialHistoryItem?: HistoryItem;
    }): Promise<void> {
        if (this._controller !== null)
            throw Error();

        const window = new BrowserWindow({
            frame: false,
            show: false,
            titleBarStyle: 'hidden',
            trafficLightPosition: { x: 20, y: 13 },
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
            ...this._restoreWindowStateService.getWindowOptions(),
        });

        this._restoreWindowStateService.observeWindow(window);

        window.loadURL(MAIN_WINDOW_URL);

        window.on('closed', () => {
            this.#historyState = {
                ableToGoBack: false,
                ableToGoForward: false,
            };
            this._controller = null;
            this._onCloseController.emit({ type: 'close' });
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messageQueue = [] as any[];

        const controller = this._controller = {
            close: () => {
                window.close();
            },
            postMessage: (message) => {
                messageQueue.push(message);
            },
            show: () => {
                window.show();
            },
            toggleDevTools: () => {
                window.webContents.toggleDevTools();
            },
        };

        let initialHistoryItem = params.initialHistoryItem ?? defaultHistoryItem;
        let channel: MessageChannelMain | null = null;

        window.on('ready-to-show', () => {
            if (channel !== null)
                channel.port1.close();
            channel = new MessageChannelMain();

            const port = channel.port1;

            while (messageQueue.length > 0)
                port.postMessage(messageQueue.shift());

            this._controller = {
                ...controller,
                postMessage: (message) => {
                    port.postMessage(message);
                },
            };

            window.webContents.postMessage('connect', {}, [channel.port2]);

            port.postMessage({
                type: 'window.initialize',
                historyItem: initialHistoryItem.toJson(),
            });

            initialHistoryItem = defaultHistoryItem;

            if (BUILD_MODE === 'development')
                window.webContents.openDevTools();

            port.start();
            port.on('message', (event) => {
                const message = event.data;
                switch (message.type) {
                    case 'history.state-changed': {
                        this.#historyState = {
                            ableToGoBack: message.ableToGoBack,
                            ableToGoForward: message.ableToGoForward,
                        };
                        this.#onHistoryStateChangedController.emit({ type: 'history-state-changed' });
                        return;
                    }

                    case 'window.context-menu': {
                        const menuId = message.menuId;
                        const convert = (item: MenuItemConstructorOptions): MenuItemConstructorOptions => {
                            const menuItemId = item.id;
                            const click = item.id == null ? undefined : () => {
                                port.postMessage({ type: 'window.context-menu-clicked', menuId, menuItemId });
                            };
                            if ('submenu' in item && Array.isArray(item.submenu))
                                return { ...item, click, submenu: item.submenu.map(convert) };
                            return { ...item, click };
                        };
                        const template = message.template.map(convert);
                        const menu = Menu.buildFromTemplate(template);
                        menu.popup({
                            window,
                            x: message.x,
                            y: message.y,
                            callback: () => {
                                port.postMessage({ type: 'window.context-menu-closed', menuId });
                            },
                        });
                        return;
                    }

                    case 'window.ready-to-show': {
                        this._onOpenController.emit({ type: 'open' });
                        window.show();
                        return;
                    }

                    default: {
                        console.error('unknown message:', message);
                        return;
                    }
                }
            });
        });
    }

    activate() {
        if (this._controller === null) {
            this._createWindow({});
            return;
        }

        this._controller.show();
    }

    addTab() {
        if (this._controller === null) {
            this._createWindow({});
            return;
        }

        this._controller.show();
        this._controller.postMessage({ type: 'window.add-tab' });
    }

    close() {
        this._controller?.close();
    }

    closeTab() {
        if (this._controller === null)
            return;
        this._controller.show();
        this._controller.postMessage({ type: 'window.close-tab' });
    }

    goBack(): void {
        this._controller?.postMessage({ type: 'history.go-back' });
    }

    goForward(): void {
        this._controller?.postMessage({ type: 'history.go-forward' });
    }

    isOpen(): boolean {
        if (this._controller === null)
            return false;
        return true;
    }

    openFile(params: {
        historyItem: HistoryItem;
    }) {
        if (this._controller === null) {
            this._createWindow({ initialHistoryItem: params.historyItem });
            return;
        }

        this._controller.show();
        this._controller.postMessage({
            type: 'window.open-file',
            historyItem: params.historyItem.toJson(),
        });
    }

    selectNextTab() {
        this._controller?.postMessage({ type: 'window.select-next-tab' });
    }

    selectPreviousTab() {
        this._controller?.postMessage({ type: 'window.select-previous-tab' });
    }

    toggleDevTools() {
        this._controller?.toggleDevTools();
    }
}
