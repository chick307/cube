import { ipcRenderer } from 'electron';
import * as pdfjsLib from 'pdfjs-dist';
import ReactDom from 'react-dom';

import { Entry, FileSystem } from '../../common/entities';
import { createContainer, createFactory } from '../../common/utils/create-container';
import { EntryView } from '../components/entry-view';
import { EntryIconServiceProvider } from '../contexts/entry-icon-service-context';
import { EntryServiceProvider } from '../contexts/entry-service-context';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import { HistoryControllerImpl } from '../controllers/history-controller';
import { useTask } from '../hooks/use-task';
import { HistoryStore } from '../stores/history-store';
import { EntryIconServiceImpl } from '../services/entry-icon-service';
import { EntryServiceImpl } from '../services/entry-service';
import { LocalEntryServiceImpl } from '../services/local-entry-service';
import { ZipEntryServiceImpl } from '../services/zip-entry-service';
import { composeElements } from '../utils/compose-elements';
import './main-window.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = './workers/pdf.worker.min.js';

const MainWindow = () => {
    const [container, error] = useTask(async () => {
        const { initailState, port } = await new Promise<{
            initailState: { entry: Entry; fileSystem: FileSystem; };
            port: MessagePort;
        }>((resolve) => {
            ipcRenderer.once('connect', (event, message) => {
                const [port] = event.ports;
                const entry = Entry.fromJson(message.entry);
                const fileSystem = FileSystem.fromJson(message.fileSystem);
                resolve({ initailState: { entry, fileSystem }, port });
            });
        });

        const container = createContainer({
            entryIconService: EntryIconServiceImpl,
            entryService: EntryServiceImpl,
            historyController: HistoryControllerImpl,
            historyStore: HistoryStore,
            historyState: createFactory(() => initailState),
            localEntryService: LocalEntryServiceImpl,
            zipEntryService: ZipEntryServiceImpl,
        });

        port.onmessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'window.open-file': {
                    const entry = Entry.fromJson(message.entry);
                    const fileSystem = FileSystem.fromJson(message.fileSystem);
                    const state = { entry, fileSystem };
                    container.historyController.navigate(state);
                    return;
                }
                default: {
                    console.error('unknown message:', event.data);
                    return;
                }
            }
        };

        port.postMessage({ type: 'window.ready-to-show' });

        return container;
    }, []);

    if (error)
        console.error(error);

    if (container == null)
        return null;

    const {
        entryIconService,
        entryService,
        historyController,
    } = container;

    return composeElements(
        <EntryIconServiceProvider value={entryIconService} />,
        <EntryServiceProvider value={entryService} />,
        <HistoryControllerProvider value={historyController} />,
        <EntryView />,
    );
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
