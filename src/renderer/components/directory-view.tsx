import React from 'react';

import { ipcRenderer } from 'electron';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { useHistoryController } from '../contexts/history-controller-context';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import { HistoryStore } from '../stores/history-store';
import styles from './directory-view.css';
import { EntryIcon } from './entry-icon';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystem;
};

const iconPlaceholder = <span className={styles.iconPlaceholder}></span>;

const DirectoryEntryView = (props: {
    entry: Entry;
    fileSystem: FileSystem;
}) => {
    const { entry, fileSystem } = props;

    const historyController = useHistoryController();

    const onClick = React.useCallback(() => {
        historyController.navigate({ entry, fileSystem });
    }, [entry, fileSystem]);

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
    const { className, entry, fileSystem } = props;

    const [entries = []] = useTask(async () => {
        const entries = await fileSystem.readDirectory(entry);
        return entries.filter((entry) => !entry.path.name.toString().startsWith('.'));
    }, [entry, fileSystem]);

    return <>
        <div className={`${className} ${styles.view}`}>
            <ul className={styles.list}>
                {entries.map((entry) => (
                    <li key={entry.name.toString()} className={styles.listItem}>
                        <DirectoryEntryView {...{ entry, fileSystem }} />
                    </li>
                ))}
            </ul>
        </div>
    </>;
};
