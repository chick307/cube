import { promises as fs } from 'fs';

import React from 'react';
import JSZip from 'jszip';

import { FileEntry } from '../entities/file-entry';
import styles from './zip-file-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
};

export const ZipFileView = (props: Props) => {
    const { className = '', entry } = props;

    const [loaded, setLoaded] = React.useState(() => false);
    const [entries, setEntries] = React.useState<JSZip.JSZipObject[]>(() => []);

    React.useEffect(() => {
        let canceled = false;

        (async () => {
            const buffer = await fs.readFile(entry.path.toString());
            if (canceled)
                return;
            const zip = await JSZip.loadAsync(buffer);
            if (canceled)
                return;
            const loadedEntries: JSZip.JSZipObject[] = [];
            zip.forEach((_, zipObject) => {
                loadedEntries.push(zipObject);
            });
            setEntries(() => loadedEntries);
            setLoaded(() => true);
        })();

        return () => {
            canceled = true;
        };
    }, [entry]);

    console.log(entries);

    return <>
        <div className={`${className} ${styles.view}`}>
            {!loaded ? <>
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
