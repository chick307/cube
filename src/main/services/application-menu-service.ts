import { Menu, dialog } from 'electron';

import { FileEntry } from '../../common/entities/file-entry';
import { LocalFileSystem } from '../../common/entities/local-file-system';
import { EntryPath } from '../../common/values/entry-path';
import type { MainWindowService } from './main-window-service';

export type ApplicationMenuService = {
    initialize(): void;
};

export class ApplicationMenuServiceImpl implements ApplicationMenuService {
    private _mainWindowService: MainWindowService;

    private _menu: Menu;

    constructor(params: {
        mainWindowService: MainWindowService;
    }) {
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
                        label: 'Close',
                        accelerator: 'Cmd+W',
                        click: () => {
                            this.onCloseClicked();
                        },
                    },
                ],
            },
        ]);
    }

    initialize() {
        Menu.setApplicationMenu(this._menu);
    }

    async onCloseClicked() {
        this._mainWindowService.close();
    }
}
