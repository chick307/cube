import React from 'react';

import { FileEntry } from '../entities/file-entry';
import { FileSystem } from '../services/file-system';
import { EntryStore } from '../stores/entry-store';
import { ImageFileView, isImageEntry } from './image-file-view';
import { ComicView, isComicEntry } from './comic-view';
import { TextFileView } from './text-file-view';
import { ZipFileView, isZipFile } from './zip-file-view';
import styles from './file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    entryStore: EntryStore;
    fileSystem: FileSystem;
};

export const FileView = (props: Props) => {
    const { className = '', entry, entryStore, fileSystem } = props;

    const view = 
        isImageEntry(entry) ? <ImageFileView className={styles.view} {...{ entry, fileSystem }} /> :
        isComicEntry(entry) ? <ComicView className={styles.view} {...{ entry, fileSystem }} /> :
        isZipFile(entry) ? <ZipFileView className={styles.view} {...{ entry, entryStore, fileSystem }} /> :
        <TextFileView className={styles.view} {...{ entry, fileSystem }} />;

    return <>
        <div className={`${className} ${styles.viewContainer}`}>
            {view}
        </div>
    </>;
};
