import type React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { EntryPath } from '../../../common/values/entry-path';
import { useEntryIconService } from '../../contexts/entry-icon-service-context';
import { useEntryService } from '../../contexts/entry-service-context';
import { useTask } from '../../hooks/use-task';
import styles from './entry-icon.module.css';

export type Props = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    entry?: Entry;
    entryPath?: EntryPath;
    fileSystem?: FileSystem;
    iconPlaceholder?: React.ReactNode;
};

const defaultPlaceholder = (
    <span className={styles.defaultPlaceholder} />
);

export const EntryIcon = (props: Props) => {
    const { entry, entryPath, fileSystem, iconPlaceholder = defaultPlaceholder, src, ...imageProps } = props;

    const entryService = useEntryService();

    const entryIconService = useEntryIconService();

    const [iconUrl] = useTask<string | null>(async (signal) => {
        if (src != null)
            return src;
        if (entry == null) {
            if (entryPath == null || fileSystem == null)
                return null;
            const e = await entryService.createEntryFromPath({ entryPath, fileSystem });
            if (e === null)
                return null;
            const iconUrl = entryIconService.getEntryIconUrl(e, { signal });
            return iconUrl;
        }
        const iconUrl = entryIconService.getEntryIconUrl(entry, { signal });
        return iconUrl;
    }, [entry, entryPath, fileSystem, src]);

    if (iconUrl == null)
        return <>{iconPlaceholder}</>;

    return <img src={iconUrl} width="16" height="16" draggable={false} {...imageProps} />;
};
