import { app, ipcMain, nativeImage } from 'electron';

ipcMain.handle('icon.getDirectoryIconDataUrl', async () => {
    const image = nativeImage.createFromNamedImage('NSFolder');
    const dataUrl = image.toDataURL();
    return dataUrl;
});

ipcMain.handle('icon.getFileIconDataUrl', async (_, entryPath) => {
    const image = await app.getFileIcon(entryPath);
    const dataUrl = image.toDataURL();
    return dataUrl;
});
