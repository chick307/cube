import React from 'react';

import { FileEntry } from '../../common/entities/file-entry';
import { FileSystem } from '../../common/entities/file-system';
import { useEntryService } from '../contexts/entry-service-context';
import { useTask } from '../hooks/use-task';
import styles from './text-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const TextFileView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();

    const [content] = useTask(async (signal) => {
        const buffer = await entryService.readFile({ entry, fileSystem  }, { signal });
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
