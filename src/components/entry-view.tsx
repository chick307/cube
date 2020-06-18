import React from 'react';

import { Entry } from '../entities/entry';
import { LocalFileSystemService } from '../services/local-file-system-service';
import { DirectoryView } from './directory-view';
import { FileView } from './file-view';

export type Props = {
    entry: Entry;
    localFileSystemService: LocalFileSystemService;
    navigator: {
        open: (entry: Entry) => void;
    };
};

export const EntryView = (props: Props) => {
    const { entry, localFileSystemService, navigator } = props;

    const view =
        entry.isDirectory() ? <DirectoryView {...{ entry, navigator }} /> :
        entry.isFile() ? <FileView {...{ entry, navigator }} /> :
        <></>;

    return <>
        <div>
            <div>
                {entry.path.toString()}
            </div>
            <div>
                {view}
            </div>
        </div>
    </>;
};
