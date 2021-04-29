import * as path from 'path';

import { BrowserWindow, app } from 'electron';

import '../handlers/icon-handler';
import '../handlers/path-handler';

let mainWindow: BrowserWindow | null = null;

const createMainWindow = () => {
    if (mainWindow !== null)
        throw Error();

    const window = mainWindow = new BrowserWindow({
        frame: false,
        height: 640,
        show: false,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 12, y: 20 },
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        width: 800,
    });

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
