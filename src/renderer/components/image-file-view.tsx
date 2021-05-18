import React from 'react';

import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useBlobUrl } from '../hooks/use-blob-url';
import styles from './image-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const ImageFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const type = React.useMemo(() => {
        const ext = entry.path.getExtension();
        if (ext === '.png')
            return 'image/png';
        if (ext === '.jpg' || ext === '.jpeg')
            return 'image/jpeg';
        return 'application/octet-stream';
    }, [entry]);

    const url = useBlobUrl({ entry, fileSystem, type });

    return (
        <div className={`${className} ${styles.view}`}>
            {url === null ? <></> : <>
                <img src={url} />
            </>}
        </div>
    );
};

export const isImageEntry = (entry: FileEntry) =>
    /^\.(?:jpe?g|png)$/i.test(entry.path.getExtension());
