import React from 'react';
import ReactDom from 'react-dom';

import { EntryView } from '../components/entry-view';
import { EntryStore } from '../stores/entry-store';
import { LocalFileSystemService } from '../services/local-file-system-service';
import styles from './main-window.css';

const MainWindow = () => {
    const localFileSystemService = React.useMemo(() => new LocalFileSystemService(), []);
    const entryStore = React.useMemo(() => new EntryStore({
        entry: localFileSystemService.getHomeDirectory(),
        fileSystem: localFileSystemService,
    }), []);

    return <>
        <EntryView className={styles.mainContent} mainContent={true} {...{ entryStore }} />
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
