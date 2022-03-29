import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import type { MediaViewerState } from '../../../common/values/viewer-state';
import type { MediaViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import styles from './media-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: MediaViewerState;
};

export const MediaViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createMediaViewerController();
    }, [viewerControllerFactory]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        blob,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.mediaViewer : `${styles.mediaViewer} ${classNameProp}`;

    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (blob === null)
            return;
        const url = URL.createObjectURL(blob);
        setUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    const videoElement =
        url !== null ? <video className={styles.video} src={url} controls /> :
        null;

    return (
        <div {...{ className }}>
            {videoElement}
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/media-viewer': {
            viewerControllerFactory: MediaViewerControllerFactory;
        };
    }
}
