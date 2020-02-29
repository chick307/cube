import * as fs from 'fs';

import { remote } from 'electron';
import React from 'react';
import ReactDom from 'react-dom';

import DirectoryEntry from '../entities/directory-entry';
import Entry from '../entities/entry';
import FileEntry from '../entities/file-entry';
import EntryName from '../values/entry-name';
import EntryPath from '../values/entry-path';

const HOME_DIRECTORY_PATH = remote.app.getPath('home');

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

const DirectoryView = (props: { entry: DirectoryEntry; navigator: Navigator; }) => {
    const { entry, navigator } = props;
    const entries = React.useMemo(() => fs.readdirSync(entry.path.toString()).map((name) => {
        const entryName = new EntryName(name);
        const entryPath = entry.path.join(entryName);
        const stat = fs.statSync(entryPath.toString());
        if (stat.isFile())
            return new FileEntry(entryPath);
        if (stat.isDirectory())
            return new DirectoryEntry(entryPath);
        return new Entry(entryPath);
    }), [entry]);
    const onEntryClick = React.useCallback((entry: Entry) => {
        navigator.open(entry);
    }, [navigator]);
    return <>
        <div>
            {entry.path.toString()}
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

    const content = React.useMemo(() => fs.readFileSync(entry.path.toString(), 'utf8'), [entry]);

    return <>
        <div>
            <div>
                {entry.path.toString()}
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

    if (entry.isDirectory()) {
        return <DirectoryView entry={entry} navigator={navigator} />;
    }

    if (entry.isFile()) {
        return <FileView entry={entry} navigator={navigator} />;
    }

    return <>
        <div>
            <div>
                {entry.path.toString()}
            </div>
        </div>
    </>;
};

const MainWindow = () => {
    const [entry, setEntry] = React.useState(() => new DirectoryEntry(new EntryPath(HOME_DIRECTORY_PATH)) as Entry);

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
