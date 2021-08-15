import * as path from 'path';

import { BrowserWindow, MessageChannelMain, app } from 'electron';

import { DirectoryEntry, LocalFileSystem } from '../../common/entities';
import type { Entry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { EntryPath } from '../../common/values/entry-path';
import type { RestoreWindowStateService } from './restore-window-state-service';

const MAIN_WINDOW_URL = `file://${path.resolve(__dirname, '../views/main-window.html')}`;

export type MainWindowService = {
    activate(): void;

    close(): void;

    isOpen(): boolean;

    navigate(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }): void;

    toggleDevTools(): void;
};

export class MainWindowServiceImpl implements MainWindowService {
    private _restoreWindowStateService: RestoreWindowStateService;

    private _controller: {
        close(): void;
        postMessage(message: unknown): void;
        show(): void;
        toggleDevTools(): void;
    } | null = null;

    constructor(params: {
        restoreWindowStateService: RestoreWindowStateService;
    }) {
        this._restoreWindowStateService = params.restoreWindowStateService;
    }

    private async _createWindow(params: {
        initialState?: {
            entry: Entry;
            fileSystem: FileSystem;
        };
    }): Promise<void> {
        if (this._controller !== null)
            throw Error();

        const window = new BrowserWindow({
            frame: false,
            show: false,
            titleBarStyle: 'hidden',
            trafficLightPosition: { x: 12, y: 20 },
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
            ...this._restoreWindowStateService.getWindowOptions(),
        });

        this._restoreWindowStateService.observeWindow(window);

        window.loadURL(MAIN_WINDOW_URL);

        window.on('closed', () => {
            this._controller = null;
        });

        const channel = new MessageChannelMain();
        const port = channel.port1;

        this._controller = {
            close: () => {
                window.close();
            },
            postMessage: (message) => {
                port.postMessage(message);
            },
            show: () => {
                window.show();
            },
            toggleDevTools: () => {
                window.webContents.toggleDevTools();
            },
        };

        await new Promise<void>((resolve) => {
            window.once('ready-to-show', () => {
                resolve();
            });
        });

        const initailState = params.initialState ?? {
            entry: new DirectoryEntry(new EntryPath(app.getPath('home'))),
            fileSystem: new LocalFileSystem(),
        };

        window.webContents.postMessage('connect', {
            entry: initailState.entry.toJson(),
            fileSystem: initailState.fileSystem.toJson(),
        }, [channel.port2]);

        port.start();
        port.on('message', (event) => {
            const message = event.data;
            switch (message.type) {
                case 'window.ready-to-show': {
                    window.show();
                    return;
                }
                default: {
                    console.error('unknown message:', message);
                    return;
                }
            }
        });
    }

    activate() {
        if (this._controller === null) {
            this._createWindow({});
            return;
        }

        this._controller.show();
    }

    close() {
        this._controller?.close();
    }

    isOpen(): boolean {
        if (this._controller === null)
            return false;
        return true;
    }

    navigate(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }) {
        if (this._controller === null) {
            this._createWindow({ initialState: state });
            return;
        }

        this._controller.show();
        this._controller.postMessage({
            type: 'window.open-file',
            entry: state.entry.toJson(),
            fileSystem: state.fileSystem.toJson(),
        });
    }

    toggleDevTools() {
        this._controller?.toggleDevTools();
    }
}
