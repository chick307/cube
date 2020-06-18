import fs from 'fs';

import React from 'react';

import { FileEntry } from '../entities/file-entry';
import styles from './image-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
};

export const ImageFileView = (props: Props) => {
    const { className = '', entry } = props;

    const contentType = React.useMemo(() => {
        const ext = entry.path.getExtension();
        if (ext === '.png')
            return 'image/png';
        if (ext === '.jpg' || ext === '.jpeg')
            return 'image/jpeg';
        return 'application/octet-stream';
    }, [entry]);

    const dataUrl = React.useMemo(() => {
        const content = fs.readFileSync(entry.path.toString());
        const dataUrl = `data:${contentType};base64,${content.toString('base64')}`;
        return dataUrl;
    }, [entry]);

    return <>
        <div className={`${className} ${styles.view}`}>
            <img src={dataUrl} />
        </div>
    </>;
};

export const isImageEntry = (entry: FileEntry) =>
    /^\.(?:jpe?g|png)$/i.test(entry.path.getExtension());
