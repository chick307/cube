import React from 'react';
import ReactDom from 'react-dom';

import { EntryView } from '../components/entry-view';
import Entry from '../entities/entry';
import LocalFileSystemService from '../services/local-file-system-service';
import './main-window.css';

const MainWindow = () => {
    const localFileSystemService = React.useMemo(() => new LocalFileSystemService(), []);

    const [entry, setEntry] = React.useState(() => localFileSystemService.getHomeDirectory() as Entry);

    const navigator = React.useMemo(() => {
        return {
            open: (entry: Entry) => {
                setEntry(entry);
            },
        };
    }, []);

    return <>
        <EntryView {...{ entry, localFileSystemService, navigator }} />
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
