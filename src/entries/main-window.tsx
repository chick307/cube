import * as fs from 'fs';

import React from 'react';
import ReactDom from 'react-dom';

import DirectoryEntry from '../entities/directory-entry';
import Entry from '../entities/entry';
import LocalFileSystemService from '../services/local-file-system-service';

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

const DirectoryView = (props: {
    entry: DirectoryEntry;
    localFileSystemService: LocalFileSystemService;
    navigator: Navigator;
}) => {
    const { entry, localFileSystemService, navigator } = props;
    const entries = React.useMemo(() => localFileSystemService.getDirectoryEntries(entry), [entry, localFileSystemService]);
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

const TextFileView = (props: { entry: Entry; }) => {
    const { entry } = props;

    const content = React.useMemo(() => fs.readFileSync(entry.path.toString(), 'utf8'), [entry]);

    return <>
        <pre>
            {content}
        </pre>
    </>;
};

const ImageFileView = (props: { entry: Entry; }) => {
    const { entry } = props;

    const contentType = React.useMemo(() => {
        const ext = entry.path.getExtension();
        if (ext === '.png')
            return 'image/png';
        if (ext === '.jpg' || ext === '.jpeg')
            return 'image/jpeg';
        return 'application/octet-stream';
    }, [entry]);

    const dataUrl = React.useMemo(() => {
        const content = fs.readFileSync(entry.path.toString());
        const dataUrl = `data:${contentType};base64,${content.toString('base64')}`;
        return dataUrl;
    }, [entry]);

    return <>
        <div>
            <img src={dataUrl} />
        </div>
    </>;
};

const FileView = (props: { entry: Entry; navigator: Navigator; }) => {
    const { entry } = props;

    const ext = entry.path.getExtension();

    const view = /^\.(?:png|jpe?g)$/.test(ext) ? <ImageFileView {...{ entry }} /> :
        <TextFileView {...{ entry }} />;

    return <>
        <div>
            <div>
                {entry.path.toString()}
            </div>
            <div>
                {view}
            </div>
        </div>
    </>;
};

const EntryView = (props: {
    entry: Entry;
    localFileSystemService: LocalFileSystemService;
    navigator: Navigator;
}) => {
    const { entry, localFileSystemService, navigator } = props;

    if (entry.isDirectory()) {
        return <DirectoryView {...{ entry, localFileSystemService, navigator }} />;
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
