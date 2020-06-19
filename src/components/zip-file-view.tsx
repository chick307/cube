import React from 'react';
import JSZip from 'jszip';

import { FileEntry } from '../entities/file-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import styles from './zip-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const ZipFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const [entries] = useTask(async (context) => {
        const buffer = await context.wrapPromise(fileSystem.readFile(entry));
        const zip = await context.wrapPromise(JSZip.loadAsync(buffer));
        const loadedEntries = Object.values(zip.files);
        return loadedEntries;
    }, [entry, fileSystem]);

    return <>
        <div className={`${className} ${styles.view}`}>
            {entries == null ? <>
                <div>...</div>
            </> : <>
                <ul className={styles.list}>
                    {entries.map((entry, index) =>
                        <li key={`${index}:${entry.name}`} className={styles.listItem}>
                            {entry.name}
                        </li>
                    )}
                </ul>
            </>}
        </div>
    </>;
};

export const isZipFile = (entry: FileEntry) =>
    /^\.(?:zip)$/.test(entry.path.getExtension());
