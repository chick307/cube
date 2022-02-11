import { ipcRenderer } from 'electron';
import * as pdfjsLib from 'pdfjs-dist';
import ReactDom from 'react-dom';

import { LocalFileSystem } from '../../common/entities/file-system';
import { createContainer, createFactory } from '../../common/utils/create-container';
import { TabView } from '../components/tab/tab-view';
import { TabControllerImpl } from '../controllers/tab-controller';
import { HistoryControllerFactoryImpl } from '../factories/history-controller-factory';
import { ServicesProvider } from '../hooks/use-service';
import { useTask } from '../hooks/use-task';
import { ApplicationServiceImpl } from '../services/application-service';
import { ContextMenuServiceImpl } from '../services/context-menu-service';
import { EntryIconServiceImpl } from '../services/entry-icon-service';
import { EntryServiceImpl } from '../services/entry-service';
import { KeyboardServiceImpl } from '../services/keyboard-service';
import { LocalEntryService, LocalEntryServiceImpl } from '../services/local-entry-service';
import { MainChannelServiceImpl } from '../services/main-channel-service';
import { ViewerServiceImpl } from '../services/viewer-service';
import { ZipEntryServiceImpl } from '../services/zip-entry-service';
import { composeElements } from '../utils/compose-elements';
import './main-window.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = './workers/pdf.worker.min.js';

const MainWindow = () => {
    const [container, error] = useTask(async () => {
        const port = await new Promise<MessagePort>((resolve) => {
            ipcRenderer.once('connect', (event) => {
                resolve(event.ports[0]);
            });
        });

        const container = createContainer({
            applicationService: ApplicationServiceImpl,
            contextMenuService: ContextMenuServiceImpl,
            defaultHistoryItem: createFactory((params: {
                localEntryService: LocalEntryService;
            }) => ({
                entry: params.localEntryService.getHomeDirectoryEntry(),
                fileSystem: new LocalFileSystem(),
            })),
            entryIconService: EntryIconServiceImpl,
            entryService: EntryServiceImpl,
            historyControllerFactory: HistoryControllerFactoryImpl,
            keyboardService: KeyboardServiceImpl,
            localEntryService: LocalEntryServiceImpl,
            mainChannelService: MainChannelServiceImpl,
            messagePort: createFactory(() => port),
            tabController: TabControllerImpl,
            viewerService: ViewerServiceImpl,
            zipEntryService: ZipEntryServiceImpl,
        });

        container.applicationService.initialize();

        container.keyboardService.attachTo(document);

        return container;
    }, []);

    if (error)
        console.error(error);

    if (container == null)
        return null;

    return composeElements(
        <ServicesProvider value={container} />,
        <TabView />,
    );
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));

document.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (event.dataTransfer === null)
        return;
    event.dataTransfer.dropEffect = 'none';
}, { capture: false });

document.addEventListener('drop', (event) => {
    event.preventDefault();
}, { capture: false });
