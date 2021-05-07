import React from 'react';

import { FileEntry } from '../../common/entities/file-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import styles from './image-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const ImageFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const contentType = React.useMemo(() => {
        const ext = entry.path.getExtension();
        if (ext === '.png')
            return 'image/png';
        if (ext === '.jpg' || ext === '.jpeg')
            return 'image/jpeg';
        return 'application/octet-stream';
    }, [entry]);

    const [dataUrl] = useTask(async (signal) => {
        const buffer = await signal.wrapPromise(fileSystem.readFile(entry));
        return `data:${contentType};base64,${buffer.toString('base64')}`;
    }, [entry, fileSystem]);

    return <>
        <div className={`${className} ${styles.view}`}>
            {dataUrl === null ? <></> : <>
                <img src={dataUrl} />
            </>}
        </div>
    </>;
};

export const isImageEntry = (entry: FileEntry) =>
    /^\.(?:jpe?g|png)$/i.test(entry.path.getExtension());
