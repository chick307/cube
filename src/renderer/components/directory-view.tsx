import React from 'react';

import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import { HistoryStore } from '../stores/history-store';
import styles from './directory-view.css';
import { EntryIcon } from './entry-icon';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystem;
    historyStore: HistoryStore;
};

const iconPlaceholder = <span className={styles.iconPlaceholder}></span>;

const DirectoryEntryView = (props: { entry: Entry; onEntryClick: (entry: Entry) => void; }) => {
    const { entry, onEntryClick } = props;

    const onClick = React.useCallback(() => { onEntryClick(entry); }, [entry, onEntryClick]);

    return <>
        <span className={styles.entryNameContainer} onDoubleClick={onClick}>
            <EntryIcon className={styles.icon} entry={entry} iconPlaceholder={iconPlaceholder} />
            <span className={styles.entryName}>
                {entry.name.toString()}
            </span>
        </span>
    </>;
};

export const DirectoryView = (props: Props) => {
    const { className, entry, fileSystem, historyStore } = props;

    const [entries = []] = useTask(async () => {
        const entries = await fileSystem.readDirectory(entry);
        return entries.filter((entry) => !entry.path.name.toString().startsWith('.'));
    }, [entry, fileSystem]);

    const onEntryClick = React.useCallback((entry: Entry) => {
        historyStore.setEntry(entry, fileSystem);
    }, [entry, fileSystem, historyStore]);

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
