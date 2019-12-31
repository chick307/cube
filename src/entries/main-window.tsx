import * as fs from 'fs';
import * as path from 'path';

import { remote } from 'electron';
import React from 'react';
import ReactDom from 'react-dom';

const HOME_DIRECTORY_PATH = remote.app.getPath('home');

type Entry = {
    name: string;
    type: 'file' | 'directory' | 'other';
};

const DirectoryEntryView = (props: { entry: Entry; onEntryClick: (entry: Entry) => void; }) => {
    const { entry, onEntryClick } = props;
    const onClick = React.useCallback(() => { onEntryClick(entry); }, [entry, onEntryClick]);
    return <>
        <span onDoubleClick={onClick}>
            {entry.name}
        </span>
    </>;
};

const DirectoryView = (props: { directoryPath: string; onEntryClick: (entry: Entry) => void; }) => {
    const { directoryPath, onEntryClick } = props;
    const entries = fs.readdirSync(directoryPath).map((name): Entry => {
        const stat = fs.statSync(path.join(directoryPath, name));
        return { name, type: stat.isFile() ? 'file' : stat.isDirectory() ? 'directory' : 'other' };
    });
    return <>
        <div>
            {directoryPath}
        </div>
        <ul>
            {entries.map((entry) => (
                <li key={entry.name}>
                    <DirectoryEntryView entry={entry} onEntryClick={onEntryClick} />
                </li>
            ))}
        </ul>
    </>;
};

const MainWindow = () => {
    const [directoryPath, setDirectoryPath] = React.useState(HOME_DIRECTORY_PATH);

    const onEntryClick = React.useCallback((entry: Entry) => {
        if (entry.type === 'directory')
            setDirectoryPath(path.resolve(directoryPath, entry.name));
    }, [directoryPath]);

    return <>
        <DirectoryView directoryPath={directoryPath} onEntryClick={onEntryClick} />
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
