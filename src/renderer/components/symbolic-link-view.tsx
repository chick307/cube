import React from 'react';

import { FileSystem } from '../../common/entities/file-system';
import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { useEntryService } from '../contexts/entry-service-context';
import { useHistoryController } from '../contexts/history-controller-context';
import { useTask } from '../hooks/use-task';
import styles from './symbolic-link-view.css';

export type Props = {
    className?: string;
    entry: SymbolicLinkEntry;
    fileSystem: FileSystem;
};

export const SymbolicLinkView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();

    const historyController = useHistoryController();

    const [destination] = useTask(async (signal) => {
        const destination = await entryService.readLink({ entry, fileSystem }, { signal });
        return destination;
    }, [entry, entryService, fileSystem]);

    const onClick = React.useCallback(() => {
        if (destination == null)
            return;
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
