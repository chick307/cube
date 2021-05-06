import React from 'react';

import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../services/file-system';
import { HistoryStore } from '../stores/history-store';
import { BinaryFileView } from './binary-file-view';
import { ImageFileView, isImageEntry } from './image-file-view';
import { ComicView, isComicEntry } from './comic-view';
import { TextFileView, isTextEntry } from './text-file-view';
import { MediaPlayer, isMediaEntry } from './media-player';
import { ZipFileView, isZipFile } from './zip-file-view';
import styles from './file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
    historyStore: HistoryStore;
};

export const FileView = (props: Props) => {
    const { className = '', entry, fileSystem, historyStore } = props;

    const view = 
        isImageEntry(entry) ? <ImageFileView className={styles.view} {...{ entry, fileSystem }} /> :
        isComicEntry(entry) ? <ComicView className={styles.view} {...{ entry, fileSystem }} /> :
        isMediaEntry(entry) ? <MediaPlayer className={styles.view} {...{ entry, fileSystem }} /> :
        isZipFile(entry) ? <ZipFileView className={styles.view} {...{ entry, fileSystem, historyStore }} /> :
        isTextEntry(entry) ? <TextFileView className={styles.view} {...{ entry, fileSystem }} /> :
        <BinaryFileView className={styles.view} {...{ entry, fileSystem }} />;

    return <>
        <div className={`${className} ${styles.viewContainer}`}>
            {view}
        </div>
    </>;
};
