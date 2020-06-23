import React from 'react';

import { useStore } from '../hooks/use-store';
import { EntryStore } from '../stores/entry-store';
import { DirectoryView } from './directory-view';
import { FileView } from './file-view';
import styles from './entry-view.css';

export type Props = {
    className?: string;
    entryStore: EntryStore;
    mainContent?: boolean;
};

export const EntryView = (props: Props) => {
    const { className = '', entryStore, mainContent = false } = props;

    const { entry, fileSystem } = useStore(entryStore);

    const view =
        entry.isDirectory() ? <DirectoryView className={styles.view} {...{ entry, entryStore, fileSystem }} /> :
        entry.isFile() ? <FileView className={styles.view} {...{ entry, entryStore, fileSystem }} /> :
        <></>;

    const ableToGoBack = entryStore.canGoBack();
    const goBack = React.useCallback(() => {
        entryStore.goBack();
    }, [entryStore]);

    const goBackButton = <button className={styles.goBackButton} disabled={!ableToGoBack} onClick={goBack}>&lt;</button>;

    return <>
        <div className={`${className} ${styles.entryView} ${mainContent ? styles.mainContent : ''}`}>
            <div className={styles.path}>
                {goBackButton}
                <span className={styles.pathString}>{entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                {view}
            </div>
        </div>
    </>;
};
