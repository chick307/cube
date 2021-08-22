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
                        id: 'close',
                        accelerator: 'Cmd+W',
                        click: () => {
                            this.onCloseClicked();
                        },
                    },
                ],
            },
            {
                label: 'Tab',
                submenu: [
                    {
                        label: 'Select Next Tab',
                        accelerator: 'Ctrl+Tab',
                        click: () => {
                            this.onSelectNextTabClicked();
                        },
                    },
                    {
                        label: 'Select Previous Tab',
                        accelerator: 'Ctrl+Shift+Tab',
                        click: () => {
                            this.onSelectPreviousTabClicked();
                        },
                    },
                ],
            },
            {
                label: 'Dev',
                visible: BUILD_MODE === 'development',
                submenu: [
                    {
                        id: 'toggle-devtools',
                        label: 'Toggle DevTools',
                        accelerator: 'Cmd+Option+I',
                        click: () => {
                            this.onToggleDevToolsClicked();
                        },
                    },
                ],
            },
        ]);
    }

    initialize() {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const closeMenuItem = this._menu.getMenuItemById('close')!;
        const toggleDevToolsMenuItem = this._menu.getMenuItemById('toggle-devtools')!;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        Menu.setApplicationMenu(this._menu);

        closeMenuItem.enabled = this._mainWindowService.isOpen();
        toggleDevToolsMenuItem.enabled = this._mainWindowService.isOpen();

        this._mainWindowService.onOpen.addListener(() => {
            closeMenuItem.enabled = true;
            toggleDevToolsMenuItem.enabled = true;
        });

        this._mainWindowService.onClose.addListener(() => {
            closeMenuItem.enabled = false;
            toggleDevToolsMenuItem.enabled = false;
        });
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
            this._mainWindowService.openFile({ entry, fileSystem });
        }
    }

    async onSelectNextTabClicked() {
        this._mainWindowService.selectNextTab();
    }

    async onSelectPreviousTabClicked() {
        this._mainWindowService.selectPreviousTab();
    }

    async onToggleDevToolsClicked() {
        this._mainWindowService.toggleDevTools();
    }
}
