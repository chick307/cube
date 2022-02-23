import React from 'react';

import type { FileSystem } from '../../../common/entities/file-system';
import type { EntryPath } from '../../../common/values/entry-path';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import type { EntryIconService } from '../../services/entry-icon-service';
import type { EntryService } from '../../services/entry-service';
import type { LocalEntryService } from '../../services/local-entry-service';
import { HomeIcon, MonitorIcon, ZipFolderIcon } from '../icons';
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

    const entryIconService = useService('entryIconService');
    const entryService = useService('entryService');
    const localEntryService = useService('localEntryService');

    const homeDirectory = React.useMemo(() => localEntryService.getHomeDirectoryEntry(), [localEntryService]);

    const [iconUrl] = useTask<string | null>(async (signal) => {
        if (src != null)
            return src;
        if (entryPath == null || fileSystem == null)
            return null;
        if (entryPath.isRoot())
            return null;
        const entry = await entryService.createEntryFromPath({ entryPath, fileSystem, signal });
        if (entry === null)
            return null;
        const iconUrl = entryIconService.getEntryIconUrl(entry, { signal });
        return iconUrl;
    }, [entryPath, fileSystem, src]);

    const className = classNameProp == null ? styles.entryIcon : `${styles.entryIcon} ${classNameProp}`;

    if (entryPath.isRoot()) {
        if (fileSystem.isZip()) {
            return (
                <span {...{ className, ...spanProps }}>{ZipFolderIcon}</span>
            );
        } else {
            return (
                <span {...{ className, ...spanProps }}>{MonitorIcon}</span>
            );
        }
    } else if (fileSystem.isLocal() && entryPath.equals(homeDirectory.path)) {
        return (
            <span {...{ className, ...spanProps }}>{HomeIcon}</span>
        );
    }

    if (iconUrl == null) {
        return (
            <span {...{ className, ...spanProps }}>
                {iconPlaceholder}
            </span>
        );
    }

    return (
        <span {...{ className, ...spanProps }}>
            <img src={iconUrl} draggable={false} />
        </span>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/entry/entry-icon': {
            entryIconService: EntryIconService;

            entryService: EntryService;

            localEntryService: LocalEntryService;
        };
    }
}
