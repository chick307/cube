import React from 'react';

import type { DirectoryEntry } from '../../../common/entities/directory-entry';
import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useEntryService } from '../../contexts/entry-service-context';
import { useHistoryController } from '../../contexts/history-controller-context';
import { useTask } from '../../hooks/use-task';
import styles from './directory-entry-view.css';
import { EntryIcon } from '../entry-icon';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystem;
};

const iconPlaceholder = <span className={styles.iconPlaceholder}></span>;

const DirectoryItemView = (props: {
    entry: Entry;
    fileSystem: FileSystem;
}) => {
    const { entry, fileSystem } = props;

    const historyController = useHistoryController();

    const onClick = React.useCallback(() => {
        historyController.navigate({ entry, fileSystem });
    }, [entry, fileSystem]);

    return (
        <span className={styles.entryNameContainer} onDoubleClick={onClick}>
            <EntryIcon className={styles.icon} entry={entry} iconPlaceholder={iconPlaceholder} />
            <span className={styles.entryName}>
                {entry.name.toString()}
            </span>
        </span>
    );
};

export const DirectoryEntryView = (props: Props) => {
    const { className, entry, fileSystem } = props;

    const entryService = useEntryService();

    const [entries = []] = useTask(async (signal) => {
        const entries = await entryService.readDirectory({ entry, fileSystem }, { signal });
        return entries.filter((entry) => !entry.path.name.toString().startsWith('.'));
    }, [entry, entryService, fileSystem]);

    return (
        <div className={`${className} ${styles.view}`}>
            <ul className={styles.list}>
                {entries.map((entry) => (
                    <li key={entry.name.toString()} className={styles.listItem}>
                        <DirectoryItemView {...{ entry, fileSystem }} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
