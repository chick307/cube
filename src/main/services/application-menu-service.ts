import { Menu, dialog } from 'electron';

import { HistoryItem } from '../../common/entities/history-item';
import type { LocalFileSystemService } from './local-file-system-service';
import type { MainWindowService } from './main-window-service';

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
                        label: 'New Tab',
                        accelerator: 'Cmd+T',
                        click: () => {
                            this.onNewTabClicked();
                        },
                    },
                    {
                        label: 'Open',
                        accelerator: 'Cmd+O',
                        click: () => {
                            this.onOpenClicked();
                        },
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: 'Close Tab',
                        id: 'close',
                        accelerator: 'Cmd+W',
                        click: () => {
                            this.onCloseTabClicked();
                        },
                    },
                    {
                        label: 'Close Window',
                        id: 'close-window',
                        accelerator: 'Cmd+Shift+W',
                        click: () => {
                            this.onCloseClicked();
                        },
                    },
                ],
            },
            {
                label: 'History',
                submenu: [
                    {
                        label: 'Go Back',
                        id: 'go-back',
                        accelerator: 'Cmd+[',
                        click: () => {
                            this._mainWindowService.goBack();
                        },
                    },
                    {
                        label: 'Go Forward',
                        id: 'go-forward',
                        accelerator: 'Cmd+]',
                        click: () => {
                            this._mainWindowService.goForward();
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
        const closeWindowMenuItem = this._menu.getMenuItemById('close-window')!;
        const goBackMenuItem = this._menu.getMenuItemById('go-back')!;
        const goForwardMenuItem = this._menu.getMenuItemById('go-forward')!;
        const toggleDevToolsMenuItem = this._menu.getMenuItemById('toggle-devtools')!;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        Menu.setApplicationMenu(this._menu);

        closeMenuItem.enabled = this._mainWindowService.isOpen();
        closeWindowMenuItem.enabled = this._mainWindowService.isOpen();
        goBackMenuItem.enabled = this._mainWindowService.ableToGoBack;
        goForwardMenuItem.enabled = this._mainWindowService.ableToGoForward;
        toggleDevToolsMenuItem.enabled = this._mainWindowService.isOpen();

        this._mainWindowService.onOpen.addListener(() => {
            closeMenuItem.enabled = true;
            closeWindowMenuItem.enabled = true;
            goBackMenuItem.enabled = this._mainWindowService.ableToGoBack;
            goForwardMenuItem.enabled = this._mainWindowService.ableToGoForward;
            toggleDevToolsMenuItem.enabled = true;
        });

        this._mainWindowService.onClose.addListener(() => {
            closeMenuItem.enabled = false;
            closeWindowMenuItem.enabled = false;
            goBackMenuItem.enabled = false;
            goForwardMenuItem.enabled = false;
            toggleDevToolsMenuItem.enabled = false;
        });

        this._mainWindowService.onHistoryStateChanged.addListener(() => {
            goBackMenuItem.enabled = this._mainWindowService.ableToGoBack;
            goForwardMenuItem.enabled = this._mainWindowService.ableToGoForward;
        });
    }

    async onCloseClicked() {
        this._mainWindowService.close();
    }

    onCloseTabClicked() {
        this._mainWindowService.closeTab();
    }

    onNewTabClicked() {
        this._mainWindowService.addTab();
    }

    async onOpenClicked() {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'openFile'] });
        if (result.canceled)
            return;
        for (const filePath of result.filePaths) {
            const entry = await this._localFileSystemService.getEntryFromPath(filePath);
            const fileSystem = this._localFileSystemService.getFileSystem();
            const historyItem = new HistoryItem({ entry, fileSystem });
            this._mainWindowService.openFile({ historyItem });
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
