import { app, ipcMain } from 'electron';

ipcMain.on('path.home', async (event) => {
    event.returnValue = app.getPath('home');
});
