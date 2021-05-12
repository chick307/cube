import React from 'react';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { LocalFileSystem } from '../../common/entities/local-file-system';
import { ZipFileSystem } from '../../common/entities/zip-file-system';
import { useHistoryController } from '../contexts/history-controller-context';
import { useTask } from '../hooks/use-task';
import { FileSystem as FileSystemService } from '../services/file-system';
import styles from './directory-view.css';
import { EntryIcon } from './entry-icon';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystemService;
};

const iconPlaceholder = <span className={styles.iconPlaceholder}></span>;

const fileSystemServiceToFileSystemEntity = (service: FileSystemService): FileSystem => {
    const container = service.getContainer();
    if (container === null)
        return new LocalFileSystem();
    return new ZipFileSystem({
        container: {
            entry: container.fileEntry,
            fileSystem: fileSystemServiceToFileSystemEntity(container.fileSystem),
        },
    });
};

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
    const { className, entry, fileSystem: fileSystemService } = props;

    const fileSystem = React.useMemo(() => {
        return fileSystemServiceToFileSystemEntity(fileSystemService)
    }, [fileSystemService]);

    const [entries = []] = useTask(async (signal) => {
        const entries = await fileSystemService.readDirectory(entry, signal);
        return entries.filter((entry) => !entry.path.name.toString().startsWith('.'));
    }, [entry, fileSystemService]);

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
