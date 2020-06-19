import React from 'react';

import { FileEntry } from '../entities/file-entry';
import { FileSystem } from '../services/file-system';
import { ZipFileSystemService } from '../services/zip-file-system-service';
import { EntryStore } from '../stores/entry-store'
import { DirectoryView } from './directory-view';

export type Props = {
    className?: string;
    entry: FileEntry;
    entryStore: EntryStore;
    fileSystem: FileSystem;
};

export const ZipFileView = (props: Props) => {
    const { className = '', entry, entryStore, fileSystem } = props;

    const zipFileSystem = React.useMemo(() => new ZipFileSystemService({
        zipFileEntry: entry,
        zipFileSystem: fileSystem,
    }), [entry, fileSystem]);

    return <>
        <DirectoryView className={`${className}`}
            entry={zipFileSystem.getRoot()} entryStore={entryStore} fileSystem={zipFileSystem} />
    </>;
};

export const isZipFile = (entry: FileEntry) =>
    /^\.(?:zip)$/.test(entry.path.getExtension());
