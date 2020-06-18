import fs from 'fs';

import React from 'react';

import { FileEntry } from '../entities/file-entry';
import styles from './text-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
};

export const TextFileView = (props: Props) => {
    const { className = '', entry } = props;

    const content = React.useMemo(() => fs.readFileSync(entry.path.toString(), 'utf8'), [entry]);

    return <>
        <div className={`${className} ${styles.view}`}>
            <pre className={styles.text}>
                {content}
            </pre>
        </div>
    </>;
};
