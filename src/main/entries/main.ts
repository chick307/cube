import * as path from 'path';

import { BrowserWindow, app } from 'electron';

import { createContainer } from '../../common/utils/create-container';
import '../handlers/icon-handler';
import '../handlers/path-handler';
import { PersistenceServiceImpl } from '../services/persistence-service';
import { RestoreWindowStateService, RestoreWindowStateServiceImpl } from '../services/restore-window-state-service';

const container = createContainer({
    persistenceService: PersistenceServiceImpl,
    restoreWindowStateService: RestoreWindowStateServiceImpl,
});

const { restoreWindowStateService } = container;

let mainWindow: BrowserWindow | null = null;

const createMainWindow = () => {
    if (mainWindow !== null)
        throw Error();

    const window = mainWindow = new BrowserWindow({
        frame: false,
        show: false,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 12, y: 20 },
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        ...restoreWindowStateService.getWindowOptions(),
    });

    restoreWindowStateService.observeWindow(window);

    window.loadURL(`file://${path.resolve(__dirname, '../views/main-window.html')}`);

    window.on('closed', () => {
        if (mainWindow === window)
            mainWindow = null;
    });

    window.on('ready-to-show', () => {
        window.show();
    });
};

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('ready', () => {
    createMainWindow();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    } else {
        mainWindow.show();
    }
});
