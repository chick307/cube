import React from 'react';

import { FileEntry } from '../entities/file-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import styles from './media-player.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const MediaPlayer = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const [url] = useTask(async (context) => {
        const buffer = await fileSystem.readFile(entry);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        context.defer(() => {
            URL.revokeObjectURL(url);
        });
        return url;
    }, [entry, fileSystem]);

    if (url == null) {
        return <>
            <div className={`${className} ${styles.player}`} />
        </>;
    }

    return <>
        <div className={`${className} ${styles.player}`}>
            <video className={styles.media} src={url} controls />
        </div>
    </>;
};

export const isMediaEntry = (entry: FileEntry) =>
    /\.(?:m4a|mp[34]|wav)/.test(entry.path.getExtension());
