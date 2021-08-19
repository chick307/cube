import React from 'react';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import type { FileEntry } from '../../common/entities/file-entry';
import { ZipFileSystem } from '../../common/entities/zip-file-system';
import { EntryPath } from '../../common/values/entry-path';
import { useHistoryController } from '../contexts/history-controller-context';
import { useStore } from '../hooks/use-store';
import { HistoryStore } from '../stores/history-store';
import styles from './entry-view.css';
import { BinaryEntryView } from './entry-views/binary-entry-view';
import { ComicEntryView, isComicEntry } from './entry-views/comic-entry-view';
import { CssEntryView, isCssEntry } from './entry-views/css-entry-view';
import { DirectoryEntryView } from './entry-views/directory-entry-view';
import { ImageEntryView, isImageEntry } from './entry-views/image-entry-view';
import { JavaScriptEntryView, isJavaScriptEntry } from './entry-views/javascript-entry-view';
import { MarkdownEntryView, isMarkdownEntry } from './entry-views/markdown-entry-view';
import { MediaEntryView, isMediaEntry } from './entry-views/media-entry-view';
import { PdfEntryView, isPdfEntry } from './entry-views/pdf-entry-view';
import { SymbolicLinkEntryView } from './entry-views/symbolic-link-entry-view';
import { TextEntryView, isTextEntry } from './entry-views/text-entry-view';
import { GoBackButton } from './go-back-button';
import { GoForwardButton } from './go-forward-button';

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
            return <DirectoryEntryView {...{ entry, ...viewProps }} />;

        if (entry.isSymbolicLink())
            return <SymbolicLinkEntryView {...{ entry, ...viewProps }} />;

        if (entry.isFile()) {
            const fileEntryViewProps = { entry, ...viewProps };
            if (isComicEntry(entry))
                return <ComicEntryView {...fileEntryViewProps} />;
            if (isCssEntry(entry))
                return <CssEntryView {...fileEntryViewProps} />;
            if (isImageEntry(entry))
                return <ImageEntryView {...fileEntryViewProps} />;
            if (isJavaScriptEntry(entry))
                return <JavaScriptEntryView {...fileEntryViewProps} />;
            if (isMarkdownEntry(entry))
                return <MarkdownEntryView {...fileEntryViewProps} />;
            if (isMediaEntry(entry))
                return <MediaEntryView {...fileEntryViewProps} />;
            if (isPdfEntry(entry))
                return <PdfEntryView {...fileEntryViewProps} />;
            if (isTextEntry(entry))
                return <TextEntryView {...fileEntryViewProps} />;
            if (isZipEntry(entry))
                return null;
            return <BinaryEntryView {...fileEntryViewProps} />;
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

    return (
        <div className={`${className} ${styles.entryView} ${mainContent ? styles.mainContent : ''}`}>
            <div className={styles.path}>
                <GoBackButton className={styles.goBackButton} />
                <GoForwardButton className={styles.goForwardButton} />
                <span className={styles.pathString}>{entry.path.toString()}</span>
            </div>
            <div className={styles.viewContainer}>
                {view}
            </div>
        </div>
    );
};
