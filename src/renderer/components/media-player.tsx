import React from 'react';

import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryService } from '../contexts/entry-service-context';
import { useTask } from '../hooks/use-task';
import styles from './media-player.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const MediaPlayer = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();

    const [url] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem }, { signal });
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        signal.defer(() => {
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
