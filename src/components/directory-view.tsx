import React from 'react';

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

    const onClick = React.useCallback(() => { onEntryClick(entry); }, [entry, onEntryClick]);

    return <>
        <span onDoubleClick={onClick}>
            {entry.name.toString()}
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
        entryStore.setEntry(entry);
    }, [entryStore]);

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
