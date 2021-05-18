import React from 'react';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import type { FileEntry } from '../../common/entities/file-entry';
import { ZipFileSystem } from '../../common/entities/zip-file-system';
import { EntryPath } from '../../common/values/entry-path';
import { useHistoryController } from '../contexts/history-controller-context';
import { useStore } from '../hooks/use-store';
import { HistoryStore } from '../stores/history-store';
import { BinaryFileView } from './binary-file-view';
import { ComicView, isComicEntry } from './comic-view';
import { DirectoryView } from './directory-view';
import styles from './entry-view.css';
import { GoBackButton } from './go-back-button';
import { GoForwardButton } from './go-forward-button';
import { ImageFileView, isImageEntry } from './image-file-view';
import { isMediaEntry, MediaPlayer } from './media-player';
import { isPdfEntry, PdfFileView } from './pdf-file-view';
import { SymbolicLinkView } from './symbolic-link-view';
import { isTextEntry, TextFileView } from './text-file-view';

export type Props = {
    className?: string;
    historyStore: HistoryStore;
    mainContent?: boolean;
};

const isZipEntry = (entry: FileEntry) =>
    /^\.(?:zip)$/.test(entry.path.getExtension());

export const EntryView = (props: Props) => {
    const { className = '', mainContent = false, historyStore } = props;

    const historyController = useHistoryController();

    const { current: { entry, fileSystem } } = useStore(historyStore);

    const view = React.useMemo(() => {
        const viewProps = { className: styles.view, fileSystem };

        if (entry.isDirectory())
            return <DirectoryView {...{ entry, ...viewProps }} />;

        if (entry.isSymbolicLink())
            return <SymbolicLinkView {...{ entry, ...viewProps }} />;

        if (entry.isFile()) {
            if (isImageEntry(entry))
                return <ImageFileView {...{ entry, ...viewProps }} />;

            if (isComicEntry(entry))
                return <ComicView {...{ entry, ...viewProps }} />;

            if (isMediaEntry(entry))
                return <MediaPlayer {...{ entry, ...viewProps }} />;

            if (isTextEntry(entry))
                return <TextFileView {...{ entry, ...viewProps }} />;

            if (isPdfEntry(entry))
                return <PdfFileView {...{ entry, ...viewProps }} />;

            if (isZipEntry(entry))
                return null;

            return <BinaryFileView {...{ entry, ...viewProps }} />;
        }

        return null;
    }, [entry, fileSystem]);

    React.useEffect(() => {
        if (entry.isFile() && isZipEntry(entry)) {
            historyController.replace({
                entry: new DirectoryEntry(new EntryPath('/')),
                fileSystem: new ZipFileSystem({
                    container: { entry, fileSystem },
                }),
            });
        }
    }, [entry, fileSystem]);

    return <>
        <div className={`${className} ${styles.entryView} ${mainContent ? styles.mainContent : ''}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} {...{ historyStore }} />
                <GoForwardButton className={styles.goForwardButton} {...{ historyStore }} />
                <span className={styles.pathString}>{entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                {view}
            </div>
        </div>
    </>;
};
