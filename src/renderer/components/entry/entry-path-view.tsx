import React from 'react';

import { Entry } from '../../../common/entities/entry';
import { FileSystem } from '../../../common/entities/file-system';
import { EntryPath } from '../../../common/values/entry-path';
import { useLocalEntryService } from '../../contexts/local-entry-service-context';
import styles from './entry-path-view.module.css';

export type Props = {
    entry: Entry;
    fileSystem: FileSystem;
};

const homeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path fillRule="evenodd" d={[
            'M17.8913288,10 L11.8900003,3.99867157 L5.88867192,10 L5.89001465,10 L5.89001465,20 L17.8900146,20',
            'L17.8900146,10 L17.8913288,10 Z M19.8900146,11.9986859 L19.8900146,20 C19.8900146,21.1045695',
            '18.9945841,22 17.8900146,22 L5.89001465,22 C4.78544515,22 3.89001465,21.1045695 3.89001465,20',
            'L3.89001465,11.9986573 L2.41319817,13.4754737 L1,12.0622756 L10.4769858,2.5852898 C11.2573722,1.8049034',
            '12.5226285,1.8049034 13.3030149,2.5852898 L22.7800007,12.0622756 L21.3668025,13.4754737',
            'L19.8900146,11.9986859 Z',
        ].join(' ')} />
    </svg>
);

const rootIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path fillRule="evenodd" d={[
            'M9,20 L9,19 L3,19 C1.8954305,19 1,18.1045695 1,17 L1,4 C1,2.8954305 1.8954305,2 3,2 L21,2 C22.1045695,2',
            '23,2.8954305 23,4 L23,17 C23,18.1045695 22.1045695,19 21,19 L15,19 L15,20 L17,20 L17,22 L7,22 L7,20 L9,20',
            'Z M3,17 L21,17 L21,4 L3,4 L3,17 Z',
        ].join(' ')}/>
    </svg>
);

const zipIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path fillRule="evenodd" d={[
            'M18,19 L21,19 L21,7 L17,6.99999363 L17,8 L18,8 L18,10 L17,10 L17,11 L18,11 L18,13 L17,13 L17,14 L18,14',
            'L18,16 L17,16 L17,17 L18,17 L18,19 Z M15,19 L15,18 L16,18 L16,17 L15,17 L15,15 L16,15 L16,14 L15,14',
            'L15,12 L16,12 L16,11 L15,11 L15,9 L16,9 L16,8 L15,8 L15,6.99999045 L11.994646,6.99998567',
            'C11.2764915,6.99614058 10.8086916,6.65990923 10.3058322,6.03654146 C10.2364281,5.95050497',
            '10.0158737,5.66440398 9.98159778,5.62115916 C9.60702158,5.14856811 9.38424442,5 9,5 L3,5 L3,19 L15,19 Z',
            'M21,5 C22.1045695,5 23,5.8954305 23,7 L23,19 C23,20.1045695 22.1045695,21 21,21 L3,21 C1.8954305,21',
            '1,20.1045695 1,19 L1,5 C1,3.8954305 1.8954305,3 3,3 L9,3 C10.1200023,3 10.832939,3.47545118',
            '11.5489764,4.37885309 C11.5967547,4.43913352 11.8100999,4.71588275 11.8624831,4.78081945',
            'C12.019726,4.97574495 12.0517795,4.99972956 12.0017863,5 L21,5 Z',
        ].join(' ')} />
    </svg>
);

const delimiter = (
    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
        <polygon fillRule="evenodd"
            points="9.586 8 4.293 2.707 5.707 1.293 12.414 8 5.707 14.707 4.293 13.293"/>
    </svg>
);

const rootDirectoryPath = new EntryPath('/');

export const EntryPathView = (props: Props) => {
    const { entry, fileSystem } = props;

    const localEntryService = useLocalEntryService();

    const paths = React.useMemo(() => {
        const homeDirectory = localEntryService.getHomeDirectoryEntry();
        const list = [] as React.ReactNode[];
        let p: EntryPath | null = entry.path;
        let i = 0;
        while (p !== null) {
            const key = i++;
            if (fileSystem.isLocal()) {
                if (p.equals(rootDirectoryPath)) {
                    list.push((
                        <span className={styles.entryName} {...{ key }}>
                            <span className={styles.rootIcon}>{rootIcon}</span>
                        </span>
                    ));
                    break;
                } else if (p.equals(homeDirectory.path)) {
                    list.push((
                        <span className={styles.entryName} {...{ key }}>
                            <span className={styles.rootIcon}>{homeIcon}</span>
                        </span>
                    ));
                    break;
                }
            } else if (fileSystem.isZip()) {
                if (p.equals(rootDirectoryPath)) {
                    list.push((
                        <span className={styles.entryName} {...{ key }}>
                            <span className={styles.zipIcon}>{zipIcon}</span>
                            <span>{fileSystem.container.entry.name.toString()}</span>
                        </span>
                    ));
                    break;
                }
            }
            list.push((
                <span className={styles.entryName} {...{ key }}>
                    <span className={styles.delimiter}>{delimiter}</span>
                    <span>{p.name.toString()}</span>
                </span>
            ));
            p = p.getParentPath();
        }
        return list.reverse();
    }, []);

    return (
        <div className={styles.entryPathView}>
            {paths}
        </div>
    );
};
