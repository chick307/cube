import React from 'react';

import { SymbolicLinkEntry } from '../common/entities/symbolic-link-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import { EntryStore } from '../stores/entry-store';
import styles from './symbolic-link-view.css';

export type Props = {
    className?: string;
    entry: SymbolicLinkEntry;
    entryStore: EntryStore;
    fileSystem: FileSystem;
};

export const SymbolicLinkView = (props: Props) => {
    const { className = '', entry, entryStore, fileSystem } = props;

    const [destination] = useTask(async (context) => {
        const destination = await context.wrapPromise(fileSystem.readLink(entry));
        return destination;
    }, [entry, fileSystem]);

    const onClick = React.useCallback(() => {
        if (destination == null)
            return;
        entryStore.setEntry(destination, fileSystem);
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
