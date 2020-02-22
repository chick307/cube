import * as fs from 'fs';
import * as path from 'path';

import { remote } from 'electron';
import React from 'react';
import ReactDom from 'react-dom';

import EntryName from '../values/entry-name';

const HOME_DIRECTORY_PATH = remote.app.getPath('home');

type Entry = {
    path: string;
    name: EntryName;
    type: 'file' | 'directory' | 'other';
};

type Navigator = {
    open: (entry: Entry) => void;
};

const DirectoryEntryView = (props: { entry: Entry; onEntryClick: (entry: Entry) => void; }) => {
    const { entry, onEntryClick } = props;
    const onClick = React.useCallback(() => { onEntryClick(entry); }, [entry, onEntryClick]);
    return <>
        <span onDoubleClick={onClick}>
            {entry.name.toString()}
        </span>
    </>;
};

const DirectoryView = (props: { directoryPath: string; navigator: Navigator; }) => {
    const { directoryPath, navigator } = props;
    const entries = React.useMemo(() => fs.readdirSync(directoryPath).map((name) => {
        const entryName = new EntryName(name);
        const stat = fs.statSync(path.join(directoryPath, name));
        return {
            name: entryName,
            path: path.join(directoryPath, name),
            type: stat.isFile() ? 'file' : stat.isDirectory() ? 'directory' : 'other',
        } as Entry;
    }), [directoryPath]);
    const onEntryClick = React.useCallback((entry: Entry) => {
        navigator.open(entry);
    }, [navigator]);
    return <>
        <div>
            {directoryPath}
        </div>
        <ul>
            {entries.map((entry) => (
                <li key={entry.name.toString()}>
                    <DirectoryEntryView entry={entry} onEntryClick={onEntryClick} />
                </li>
            ))}
        </ul>
    </>;
};

const FileView = (props: { entry: Entry; navigator: Navigator; }) => {
    const { entry } = props;

    const content = React.useMemo(() => fs.readFileSync(entry.path, 'utf8'), [entry]);

    return <>
        <div>
            <div>
                {entry.path}
            </div>
            <div>
                <pre>
                    {content}
                </pre>
            </div>
        </div>
    </>;
};

const EntryView = (props: { entry: Entry; navigator: Navigator; }) => {
    const { entry, navigator } = props;

    if (entry.type === 'directory') {
        return <DirectoryView directoryPath={entry.path} navigator={navigator} />;
    }

    if (entry.type === 'file') {
        return <FileView entry={entry} navigator={navigator} />;
    }

    return <>
        <div>
            <div>
                {entry.path}
            </div>
        </div>
    </>;
};

const MainWindow = () => {
    const [entry, setEntry] = React.useState<Entry>(() => ({
        name: new EntryName(path.basename(HOME_DIRECTORY_PATH)),
        path: HOME_DIRECTORY_PATH,
        type: 'directory',
    }));

    const navigator = React.useMemo(() => {
        return {
            open: (entry: Entry) => {
                setEntry(entry);
            },
        };
    }, []);

    return <>
        <EntryView entry={entry} navigator={navigator} />
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
