import React from 'react';

import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { useEntryText } from '../../hooks/use-entry-text';
import styles from './tsv-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const TsvEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const content = useEntryText({ entry, fileSystem });

    const table = React.useMemo(() => {
        if (content === null)
            return null;
        const lines = content.split('\n');
        const rows = lines.map((line, index) => {
            if (line === '' && index === lines.length - 1)
                return null;
            const values = line.split('\t');
            return (
                <tr key={index}>
                    {values.map((value, i) => {
                        return (
                            <td key={i} className={styles.cell}>{value}</td>
                        );
                    })}
                </tr>
            );
        });
        return (
            <table className={styles.table}>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }, [content]);

    return (
        <div className={`${className} ${styles.tsvViewer}`}>
            {table}
        </div>
    );
};
