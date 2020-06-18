import React from 'react';
import ReactDom from 'react-dom';

import { EntryView } from '../components/entry-view';
import { EntryStore } from '../stores/entry-store';
import { LocalFileSystemService } from '../services/local-file-system-service';
import './main-window.css';

const MainWindow = () => {
    const localFileSystemService = React.useMemo(() => new LocalFileSystemService(), []);
    const entryStore = React.useMemo(() => new EntryStore({ localFileSystemService }), []);

    return <>
        <EntryView {...{ entryStore }} />
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
