import { ipcRenderer } from 'electron';
import * as pdfjsLib from 'pdfjs-dist';
import ReactDom from 'react-dom';

import { Entry, FileSystem, LocalFileSystem } from '../../common/entities';
import { createContainer, createFactory } from '../../common/utils/create-container';
import { TabView } from '../components/tab-view';
import { EntryIconServiceProvider } from '../contexts/entry-icon-service-context';
import { EntryServiceProvider } from '../contexts/entry-service-context';
import { TabControllerProvider } from '../contexts/tab-controller-context';
import { TabControllerImpl } from '../controllers/tab-controller';
import { HistoryControllerFactoryImpl } from '../factories/history-controller-factory';
import { useTask } from '../hooks/use-task';
import { EntryIconServiceImpl } from '../services/entry-icon-service';
import { EntryServiceImpl } from '../services/entry-service';
import { LocalEntryService, LocalEntryServiceImpl } from '../services/local-entry-service';
import { ZipEntryServiceImpl } from '../services/zip-entry-service';
import { composeElements } from '../utils/compose-elements';
import './main-window.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = './workers/pdf.worker.min.js';

const MainWindow = () => {
    const [container, error] = useTask(async () => {
        const { initialHistoryItem, port } = await new Promise<{
            initialHistoryItem: { entry: Entry; fileSystem: FileSystem; };
            port: MessagePort;
        }>((resolve) => {
            ipcRenderer.once('connect', (event, message) => {
                const [port] = event.ports;
                const entry = Entry.fromJson(message.entry);
                const fileSystem = FileSystem.fromJson(message.fileSystem);
                resolve({ initialHistoryItem: { entry, fileSystem }, port });
            });
        });

        const container = createContainer({
            defaultHistoryItem: createFactory((params: {
                localEntryService: LocalEntryService;
            }) => ({
                entry: params.localEntryService.getHomeDirectoryEntry(),
                fileSystem: new LocalFileSystem(),
            })),
            entryIconService: EntryIconServiceImpl,
            entryService: EntryServiceImpl,
            historyControllerFactory: HistoryControllerFactoryImpl,
            localEntryService: LocalEntryServiceImpl,
            tabController: TabControllerImpl,
            zipEntryService: ZipEntryServiceImpl,
        });

        container.tabController.addTab({ active: true, historyItem: initialHistoryItem });

        container.tabController.onTabAllClosed.addListener(() => {
            window.close();
        });

        const onStateChanged = (event: { tabId: number; }) => {
            const tab = container.tabController.state.current.tabs.find((tab) => tab.id === event.tabId);
            if (tab == null || !tab.active)
                return;
            port.postMessage({
                type: 'history.state-changed',
                ableToGoBack: tab.historyController.state.current.ableToGoBack,
                ableToGoForward: tab.historyController.state.current.ableToGoForward,
            });
        };

        container.tabController.onActiveTabChanged.addListener(onStateChanged);
        container.tabController.onHistoryStateChanged.addListener(onStateChanged);

        port.onmessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'history.go-back': {
                    const tab = container.tabController.state.current.tabs.find((tab) => tab.active);
                    if (tab == null)
                        return;
                    tab.historyController.goBack();
                    return;
                }
                case 'history.go-forward': {
                    const tab = container.tabController.state.current.tabs.find((tab) => tab.active);
                    if (tab == null)
                        return;
                    tab.historyController.goForward();
                    return;
                }
                case 'window.add-tab': {
                    container.tabController.addTab({ active: true });
                    return;
                }
                case 'window.close-tab': {
                    const tab = container.tabController.state.current.tabs.find((tab) => tab.active);
                    if (tab == null)
                        return;
                    container.tabController.removeTab({ id: tab.id });
                    return;
                }
                case 'window.open-file': {
                    const entry = Entry.fromJson(message.entry);
                    const fileSystem = FileSystem.fromJson(message.fileSystem);
                    container.tabController.addTab({ active: true, historyItem: { entry, fileSystem } });
                    return;
                }
                case 'window.select-next-tab': {
                    container.tabController.selectNextTab();
                    return;
                }
                case 'window.select-previous-tab': {
                    container.tabController.selectPreviousTab();
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
        tabController,
    } = container;

    return composeElements(
        <EntryIconServiceProvider value={entryIconService} />,
        <EntryServiceProvider value={entryService} />,
        <TabControllerProvider value={tabController} />,
        <TabView />,
    );
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
