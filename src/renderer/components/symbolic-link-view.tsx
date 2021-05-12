import React from 'react';

import { FileSystem } from '../../common/entities/file-system';
import { LocalFileSystem } from '../../common/entities/local-file-system';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { ZipFileSystem } from '../../common/entities/zip-file-system';
import { useHistoryController } from '../contexts/history-controller-context';
import { useTask } from '../hooks/use-task';
import { FileSystem as FileSystemService } from '../services/file-system';
import styles from './symbolic-link-view.css';

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

export type Props = {
    className?: string;
    entry: SymbolicLinkEntry;
    fileSystem: FileSystemService;
};

export const SymbolicLinkView = (props: Props) => {
    const { className = '', entry, fileSystem: fileSystemService } = props;

    const historyController = useHistoryController();

    const [destination] = useTask(async (signal) => {
        const destination = await fileSystemService.readLink(entry, signal);
        return destination;
    }, [entry, fileSystemService]);

    const onClick = React.useCallback(() => {
        if (destination == null)
            return;
        const fileSystem = fileSystemServiceToFileSystemEntity(fileSystemService);
        historyController.navigate({ entry: destination, fileSystem });
    }, [destination]);

    if (destination == null)
        return <></>;

    return <>
        <div className={`${className} ${styles.view}`}>
            <span className={styles.destPath} onClick={onClick}>
                {destination.path.toString()}
            </span>
        </div>
    </>;
};
