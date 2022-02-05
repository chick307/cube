import React from 'react';

import type { FileSystem } from '../../../common/entities/file-system';
import type { EntryPath } from '../../../common/values/entry-path';
import { useEntryIconService } from '../../contexts/entry-icon-service-context';
import { useEntryService } from '../../contexts/entry-service-context';
import { useTask } from '../../hooks/use-task';
import styles from './entry-icon.module.css';

export type Props = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
    entryPath: EntryPath;
    fileSystem: FileSystem;
    iconPlaceholder?: React.ReactNode;
};

const defaultPlaceholder = (
    <span className={styles.defaultPlaceholder} />
);

export const EntryIcon = (props: Props) => {
    const {
        className: classNameProp,
        entryPath,
        fileSystem,
        iconPlaceholder = defaultPlaceholder,
        src,
        ...spanProps
    } = props;

    const entryService = useEntryService();

    const entryIconService = useEntryIconService();

    const [iconUrl] = useTask<string | null>(async (signal) => {
        if (src != null)
            return src;
        if (entryPath == null || fileSystem == null)
            return null;
        const entry = await entryService.createEntryFromPath({ entryPath, fileSystem, signal });
        if (entry === null)
            return null;
        const iconUrl = entryIconService.getEntryIconUrl(entry, { signal });
        return iconUrl;
    }, [entryPath, fileSystem, src]);

    const className = classNameProp == null ? styles.entryIcon : `${styles.entryIcon} ${classNameProp}`;

    if (iconUrl == null)
        return <>{iconPlaceholder}</>;

    return (
        <span {...{ className, ...spanProps }}>
            <img src={iconUrl} draggable={false} />
        </span>
    );
};
