import { ipcRenderer } from 'electron';
import React from 'react';

import { Entry } from '../../common/entities/entry';
import { useEntryIconService } from '../contexts/entry-icon-service-context';
import { useTask } from '../hooks/use-task';

export type Props = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    entry: Entry;
    iconPlaceholder: React.ReactNode;
};

export const EntryIcon = (props: Props) => {
    const { entry, iconPlaceholder, src, ...imageProps } = props;

    const entryIconService = useEntryIconService();

    const [iconUrl] = useTask<string>(async (signal) => {
        if (src != null)
            return src;
        const iconUrl = entryIconService.getEntryIconUrl(entry, { signal });
        return iconUrl;
    }, [src, entry]);

    if (iconUrl == null)
        return <>{iconPlaceholder}</>;

    return <img src={iconUrl} width="16" height="16" {...imageProps} />;
};
