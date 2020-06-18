import React from 'react';

import { FileEntry } from '../entities/file-entry';
import { EntryStore } from '../stores/entry-store';
import { ImageFileView, isImageEntry } from './image-file-view';
import { TextFileView } from './text-file-view';

export type Props = {
    entry: FileEntry;
    entryStore: EntryStore;
};

export const FileView = (props: Props) => {
    const { entry } = props;

    const view = 
        isImageEntry(entry) ? <ImageFileView {...{ entry }} /> :
        <TextFileView {...{ entry }} />;

    return <>
        <div>
            {view}
        </div>
    </>;
};
