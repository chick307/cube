import React from 'react';
import ReactDom from 'react-dom';

import { EntryView } from '../components/entry-view';
import { HistoryStore } from '../stores/history-store';
import { LocalFileSystemService } from '../services/local-file-system-service';
import styles from './main-window.css';

const MainWindow = () => {
    const localFileSystemService = React.useMemo(() => new LocalFileSystemService(), []);
    const historyStore = React.useMemo(() => new HistoryStore({
        entry: localFileSystemService.getHomeDirectory(),
        fileSystem: localFileSystemService,
    }), []);

    return <>
        <EntryView className={styles.mainContent} mainContent={true} {...{ historyStore }} />
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));