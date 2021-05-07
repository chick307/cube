import React from 'react';

import { useStore } from '../hooks/use-store';
import { HistoryStore } from '../stores/history-store';
import { DirectoryView } from './directory-view';
import { FileView } from './file-view';
import styles from './entry-view.css';
import { GoBackButton } from './go-back-button';
import { SymbolicLinkView } from './symbolic-link-view';

export type Props = {
    className?: string;
    historyStore: HistoryStore;
    mainContent?: boolean;
};

export const EntryView = (props: Props) => {
    const { className = '', mainContent = false, historyStore } = props;

    const { current: { entry, fileSystem } } = useStore(historyStore);

    const view = React.useMemo(() => {
        const viewProps = { className: styles.view, fileSystem };
        const view =
            entry.isDirectory() ? <DirectoryView {...{ entry, ...viewProps }} /> :
            entry.isFile() ? <FileView {...{ entry, ...viewProps }} /> :
            entry.isSymbolicLink() ? <SymbolicLinkView {...{ entry, ...viewProps }} /> :
            <></>;
        return view;
    }, [entry, fileSystem]);

    return <>
        <div className={`${className} ${styles.entryView} ${mainContent ? styles.mainContent : ''}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} {...{ historyStore }} />
                <span className={styles.pathString}>{entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                {view}
            </div>
        </div>
    </>;
};
