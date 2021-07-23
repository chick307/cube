import * as path from 'path';

import { BrowserWindow } from 'electron';

import type { RestoreWindowStateService } from './restore-window-state-service';
import type { Entry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';

const MAIN_WINDOW_URL = `file://${path.resolve(__dirname, '../views/main-window.html')}`;

export type MainWindowService = {
    activate(): void;

    close(): void;

    navigate(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }): void;
};

export class MainWindowServiceImpl implements MainWindowService {
    private _restoreWindowStateService: RestoreWindowStateService;

    private _window: BrowserWindow | null = null;

    constructor(params: {
        restoreWindowStateService: RestoreWindowStateService;
    }) {
        this._restoreWindowStateService = params.restoreWindowStateService;
    }

    private async _createWindow(): Promise<BrowserWindow> {
        if (this._window !== null)
            throw Error();

        this._window = new BrowserWindow({
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

        this._restoreWindowStateService.observeWindow(this._window);

        this._window.loadURL(MAIN_WINDOW_URL);

        this._window.on('closed', () => {
            this._window = null;
        });

        await new Promise<void>((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._window!.once('ready-to-show', () => {
                if (this._window !== null)
                    this._window.show();
                resolve();
            });
        });

        return this._window;
    }

    activate() {
        if (this._window === null) {
            this._createWindow();
        } else {
            this._window.show();
        }
    }

    close() {
        if (this._window === null)
            return;
        this._window.close();
    }

    navigate(state: {
        entry: Entry;
        fileSystem: FileSystem;
    }) {
        Promise.resolve().then(async () => {
            let window = this._window;
            if (window === null) {
                window = await this._createWindow();
            } else {
                window.show();
            }

            window.webContents.postMessage('history.navigate', {
                entry: state.entry.toJson(),
                fileSystem: state.fileSystem.toJson(),
            });
        });
    }
}
