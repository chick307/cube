import { ipcRenderer } from 'electron';
import React from 'react';

import { Entry } from '../../common/entities/entry';
import { useTask } from '../hooks/use-task';

export type Props = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    entry: Entry;
    iconPlaceholder: React.ReactNode;
};

export const EntryIcon = (props: Props) => {
    const { entry, iconPlaceholder, src, ...imageProps } = props;

    const [iconUrl] = useTask<string>(async (signal) => {
        if (src != null)
            return src;
        const iconUrl = entry.isDirectory() ?
            await signal.wrapPromise(ipcRenderer.invoke('icon.getDirectoryIconDataUrl', entry.path.toString())) :
            await signal.wrapPromise(ipcRenderer.invoke('icon.getFileIconDataUrl', entry.path.toString()));
        return iconUrl;
    }, [src, entry]);

    if (iconUrl == null)
        return <>{iconPlaceholder}</>;

    return <img src={iconUrl} width="16" height="16" {...imageProps} />;
};
