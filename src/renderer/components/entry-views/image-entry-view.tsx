import React from 'react';

import type { FileEntry } from '../../../common/entities/file-entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useBlobUrl } from '../../hooks/use-blob-url';
import styles from './image-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const ImageEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const type = React.useMemo(() => {
        const ext = entry.path.getExtension();
        if (ext === '.png')
            return 'image/png';
        if (ext === '.jpg' || ext === '.jpeg')
            return 'image/jpeg';
        if (ext === '.svg')
            return 'image/svg+xml';
        if (ext === '.webp')
            return 'image/webp';
        return 'application/octet-stream';
    }, [entry]);

    const url = useBlobUrl({ entry, fileSystem, type });

    return (
        <div className={`${className} ${styles.view}`}>
            {url === null ? null : (
                <img src={url} />
            )}
        </div>
    );
};

export const isImageEntry = (entry: FileEntry) =>
    /^\.(?:jpe?g|png|svg|webp)$/i.test(entry.path.getExtension());
