import React from 'react';

import { FileEntry } from '../entities/file-entry';
import { EntryStore } from '../stores/entry-store';
import { ImageFileView, isImageEntry } from './image-file-view';
import { TextFileView } from './text-file-view';
import styles from './file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    entryStore: EntryStore;
};

export const FileView = (props: Props) => {
    const { className = '', entry } = props;

    const view = 
        isImageEntry(entry) ? <ImageFileView className={styles.view} {...{ entry }} /> :
        <TextFileView className={styles.view} {...{ entry }} />;

    return <>
        <div className={`${className} ${styles.viewContainer}`}>
            {view}
        </div>
    </>;
};
