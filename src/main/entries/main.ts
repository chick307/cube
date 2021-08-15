import { app } from 'electron';

import { createContainer } from '../../common/utils/create-container';
import '../handlers/icon-handler';
import '../handlers/path-handler';
import { ApplicationMenuServiceImpl } from '../services/application-menu-service';
import { LocalFileSystemServiceImpl } from '../services/local-file-system-service';
import { MainWindowServiceImpl } from '../services/main-window-service';
import { PersistenceServiceImpl } from '../services/persistence-service';
import { RestoreWindowStateServiceImpl } from '../services/restore-window-state-service';

const container = createContainer({
    applicationMenuService: ApplicationMenuServiceImpl,
    localFileSystemService: LocalFileSystemServiceImpl,
    mainWindowService: MainWindowServiceImpl,
    persistenceService: PersistenceServiceImpl,
    restoreWindowStateService: RestoreWindowStateServiceImpl,
});

const {
    applicationMenuService,
    localFileSystemService,
    mainWindowService,
} = container;

let ready = false;
let startEntryPath: string | null = null;

applicationMenuService.initialize();

const openEntry = async (pathString: string) => {
    const entry = await localFileSystemService.getEntryFromPath(pathString);
    const fileSystem = localFileSystemService.getFileSystem();
    mainWindowService.navigate({ entry, fileSystem });
};

app.on('open-file', (event, path) => {
    event.preventDefault();
    if (!ready) {
        startEntryPath = path;
    } else {
        openEntry(path);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('ready', () => {
    ready = true;
    if (startEntryPath !== null) {
        openEntry(startEntryPath);
        startEntryPath = null;
    } else {
        mainWindowService.activate();
    }
});

app.on('activate', () => {
    mainWindowService.activate();
});
