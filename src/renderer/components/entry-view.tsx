import React from 'react';

import { useStore } from '../hooks/use-store';
import { EntryStore } from '../stores/entry-store';
import { DirectoryView } from './directory-view';
import { FileView } from './file-view';
import styles from './entry-view.css';
import { GoBackButton } from './go-back-button';
import { SymbolicLinkView } from './symbolic-link-view';

export type Props = {
    className?: string;
    entryStore: EntryStore;
    mainContent?: boolean;
};

export const EntryView = (props: Props) => {
    const { className = '', entryStore, mainContent = false } = props;

    const { entry, fileSystem } = useStore(entryStore);

    const view = React.useMemo(() => {
        const viewProps = { className: styles.view, entryStore, fileSystem };
        const view =
            entry.isDirectory() ? <DirectoryView entry={entry} {...viewProps} /> :
            entry.isFile() ? <FileView entry={entry} {...viewProps} /> :
            entry.isSymbolicLink() ? <SymbolicLinkView entry={entry} {...viewProps} /> :
            <></>;
        return view;
    }, [entry, entryStore, fileSystem]);

    return <>
        <div className={`${className} ${styles.entryView} ${mainContent ? styles.mainContent : ''}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} {...{ entryStore }} />
                <span className={styles.pathString}>{entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                {view}
            </div>
        </div>
    </>;
};
