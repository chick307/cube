import React from 'react';

import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../entities/directory-entry';
import { Entry } from '../entities/entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import { EntryStore } from '../stores/entry-store';
import styles from './directory-view.css';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    entryStore: EntryStore;
    fileSystem: FileSystem;
};

const DirectoryEntryView = (props: { entry: Entry; onEntryClick: (entry: Entry) => void; }) => {
    const { entry, onEntryClick } = props;

    const [iconUrl] = useTask<string>(async (context) => {
        const iconUrl = entry.isDirectory() ?
            await context.wrapPromise(ipcRenderer.invoke('icon.getDirectoryIconDataUrl', entry.path.toString())) :
            await context.wrapPromise(ipcRenderer.invoke('icon.getFileIconDataUrl', entry.path.toString()));
        return iconUrl;
    }, [entry]);

    const icon = React.useMemo(() => {
        if (iconUrl == null)
            return <span className={styles.iconPlaceholder}></span>;
        return <img className={styles.icon} src={iconUrl} />;
    }, [iconUrl]);

    const onClick = React.useCallback(() => { onEntryClick(entry); }, [entry, onEntryClick]);

    return <>
        <span className={styles.entryNameContainer} onDoubleClick={onClick}>
            {icon}
            <span className={styles.entryName}>
                {entry.name.toString()}
            </span>
        </span>
    </>;
};

export const DirectoryView = (props: Props) => {
    const { className, entry, entryStore, fileSystem } = props;

    const [entries = []] = useTask(async () => {
        const entries = fileSystem.readDirectory(entry);
        return entries;
    }, [entry, fileSystem]);

    const onEntryClick = React.useCallback((entry: Entry) => {
        entryStore.setEntry(entry, fileSystem);
    }, [entry, entryStore, fileSystem]);

    return <>
        <div className={`${className} ${styles.view}`}>
            <ul className={styles.list}>
                {entries.map((entry) => (
                    <li key={entry.name.toString()} className={styles.listItem}>
                        <DirectoryEntryView entry={entry} onEntryClick={onEntryClick} />
                    </li>
                ))}
            </ul>
        </div>
    </>;
};
