import { promises as fs } from 'fs';

import { Menu, dialog } from 'electron';

import type { MainWindowService } from './main-window-service';
import type { LocalFileSystemService } from './local-file-system-service';

export type ApplicationMenuService = {
    initialize(): void;
};

export class ApplicationMenuServiceImpl implements ApplicationMenuService {
    private _localFileSystemService: LocalFileSystemService;

    private _mainWindowService: MainWindowService;

    private _menu: Menu;

    constructor(params: {
        localFileSystemService: LocalFileSystemService;
        mainWindowService: MainWindowService;
    }) {
        this._localFileSystemService = params.localFileSystemService;
        this._mainWindowService = params.mainWindowService;
        this._menu = Menu.buildFromTemplate([
            {
                role: 'appMenu',
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'quit' },
                ],
            },
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open',
                        accelerator: 'Cmd+O',
                        click: () => {
                            this.onOpenClicked();
                        },
                    },
                    {
                        label: 'Close',
                        accelerator: 'Cmd+W',
                        click: () => {
                            this.onCloseClicked();
                        },
                    },
                ],
            },
            ...(BUILD_MODE === 'development' ? [{
                label: 'Dev',
                submenu: [
                    {
                        label: 'Toggle DevTools',
                        accelerator: 'Cmd+Option+I',
                        click: () => {
                            this.onToggleDevToolsClicked();
                        },
                    },
                ],
            }] : []),
        ]);
    }

    initialize() {
        Menu.setApplicationMenu(this._menu);
    }

    async onCloseClicked() {
        this._mainWindowService.close();
    }

    async onOpenClicked() {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'openFile'] });
        if (result.canceled)
            return;
        for (const filePath of result.filePaths) {
            const entry = await this._localFileSystemService.getEntryFromPath(filePath);
            const fileSystem = this._localFileSystemService.getFileSystem();
            this._mainWindowService.navigate({ entry, fileSystem });
        }
    }

    async onToggleDevToolsClicked() {
        this._mainWindowService.toggleDevTools();
    }
}
