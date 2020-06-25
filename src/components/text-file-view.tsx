import React from 'react';

import { FileEntry } from '../entities/file-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import styles from './text-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const TextFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const [content] = useTask(async (context) => {
        const buffer = await context.wrapPromise(fileSystem.readFile(entry));
        const text = buffer.toString('utf-8');
        return text;
    }, [entry, fileSystem]);

    return <>
        <div className={`${className} ${styles.view}`}>
            {content === null ? <></> : <>
                <pre className={styles.text}>
                    {content}
                </pre>
            </>}
        </div>
    </>;
};

export const isTextEntry = (entry: FileEntry) =>
    /^\.(?:txt)$/.test(entry.path.getExtension());
