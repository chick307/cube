import React from 'react';
import ReactDom from 'react-dom';

import { LocalFileSystem } from '../../common/entities/local-file-system';
import { EntryView } from '../components/entry-view';
import { HistoryControllerProvider } from '../contexts/history-controller-context';
import { HistoryControllerImpl } from '../controllers/history-controller';
import { HistoryStore } from '../stores/history-store';
import { LocalFileSystemService } from '../services/local-file-system-service';
import { composeElements } from '../utils/compose-elements';
import styles from './main-window.css';

const MainWindow = () => {
    const localFileSystemService = React.useMemo(() => new LocalFileSystemService(), []);
    const historyStore = React.useMemo(() => new HistoryStore({
        historyState: {
            entry: localFileSystemService.getHomeDirectory(),
            fileSystem: new LocalFileSystem(),
        },
    }), []);
    const historyController = React.useMemo(() => new HistoryControllerImpl({ historyStore }), [historyStore]);

    return composeElements([
        <HistoryControllerProvider value={historyController} />,
        <EntryView className={styles.mainContent} mainContent={true} {...{ historyStore }} />,
    ]);
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
