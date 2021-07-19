import { app } from 'electron';

import { createContainer } from '../../common/utils/create-container';
import '../handlers/icon-handler';
import '../handlers/path-handler';
import { MainWindowServiceImpl } from '../services/main-window-service';
import { PersistenceServiceImpl } from '../services/persistence-service';
import { RestoreWindowStateServiceImpl } from '../services/restore-window-state-service';

const container = createContainer({
    mainWindowService: MainWindowServiceImpl,
    persistenceService: PersistenceServiceImpl,
    restoreWindowStateService: RestoreWindowStateServiceImpl,
});

const {
    mainWindowService,
} = container;


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('ready', () => {
    mainWindowService.activate();
});

app.on('activate', () => {
    mainWindowService.activate();
});
