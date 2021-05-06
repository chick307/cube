import React from 'react';

import { FileEntry } from '../../common/entities/file-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import styles from './binary-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const BinaryFileView = (props: Props) => {
    const { className, entry, fileSystem } = props;

    const [text = ''] = useTask(async (context) => {
        const buffer = await context.wrapPromise(fileSystem.readFile(entry));
        let text = '';
        let i: number;
        for (i = 0; i < buffer.length; i++) {
            if (i % 16 === 0)
                text += i.toString(16).toUpperCase().padStart(8, '0') + '  ';
            text += buffer[i].toString(16).toUpperCase().padStart(2, '0');
            text += (i % 16 === 15) ? '\n' : (i % 8 === 7) ? '  ' : ' ';
        }
        if (i % 16 !== 0)
            text += '\n';
        return text;
    }, [entry, fileSystem]);

    return React.useMemo(() => <>
        <div className={`${className} ${styles.view}`}>
            <pre className={styles.content}>
                {text}
            </pre>
        </div>
    </>, [text]);
};
