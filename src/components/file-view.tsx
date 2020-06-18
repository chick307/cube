import React from 'react';

import { Entry } from '../entities/entry';
import { FileEntry } from '../entities/file-entry';
import { ImageFileView, isImageEntry } from './image-file-view';
import { TextFileView } from './text-file-view';

export type Props = {
    entry: FileEntry;
    navigator: {
        open: (entry: Entry) => void;
    };
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
