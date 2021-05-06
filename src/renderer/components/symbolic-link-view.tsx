import React from 'react';

import { SymbolicLinkEntry } from '../../common/entities/symbolic-link-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import { HistoryStore } from '../stores/history-store';
import styles from './symbolic-link-view.css';

export type Props = {
    className?: string;
    entry: SymbolicLinkEntry;
    fileSystem: FileSystem;
    historyStore: HistoryStore;
};

export const SymbolicLinkView = (props: Props) => {
    const { className = '', entry, fileSystem, historyStore } = props;

    const [destination] = useTask(async (context) => {
        const destination = await context.wrapPromise(fileSystem.readLink(entry));
        return destination;
    }, [entry, fileSystem]);

    const onClick = React.useCallback(() => {
        if (destination == null)
            return;
        historyStore.setEntry(destination, fileSystem);
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
