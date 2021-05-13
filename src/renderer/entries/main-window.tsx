import React from 'react';
import ReactDom from 'react-dom';

import { LocalFileSystem } from '../../common/entities/local-file-system';
import { createContainer, createFactory } from '../../common/utils/create-container';
import { EntryView } from '../components/entry-view';
import { EntryIconServiceProvider } from '../contexts/entry-icon-service-context';
import { EntryServiceProvider } from '../contexts/entry-service-context';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import { HistoryControllerImpl } from '../controllers/history-controller';
import { HistoryStore } from '../stores/history-store';
import { composeElements } from '../utils/compose-elements';
import { EntryIconServiceImpl } from '../services/entry-icon-service';
import { EntryServiceImpl } from '../services/entry-service';
import { LocalEntryService, LocalEntryServiceImpl } from '../services/local-entry-service';
import { ZipEntryServiceImpl } from '../services/zip-entry-service';
import styles from './main-window.css';

const MainWindow = () => {
    const {
        entryIconService,
        entryService,
        historyController,
        historyStore,
    } = React.useMemo(() => {
        return createContainer({
            entryIconService: EntryIconServiceImpl,
            entryService: EntryServiceImpl,
            historyController: HistoryControllerImpl,
            historyStore: HistoryStore,
            historyState: createFactory(({ localEntryService }: {
                localEntryService: LocalEntryService;
            }) => ({
                entry: localEntryService.getHomeDirectoryEntry(),
                fileSystem: new LocalFileSystem(),
            })),
            localEntryService: LocalEntryServiceImpl,
            zipEntryService: ZipEntryServiceImpl,
        });
    }, []);

    return composeElements(
        <EntryIconServiceProvider value={entryIconService} />,
        <EntryServiceProvider value={entryService} />,
        <HistoryControllerProvider value={historyController} />,
        <EntryView className={styles.mainContent} mainContent={true} {...{ historyStore }} />,
    );
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
