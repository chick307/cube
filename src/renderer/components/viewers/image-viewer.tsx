import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import type { ImageViewerState } from '../../../common/values/viewer-state';
import type { ImageViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import styles from './image-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: ImageViewerState;
};

export const ImageViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createImageViewerController();
    }, [viewerControllerFactory]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const {
        blob,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.imageViewer : `${styles.imageViewer} ${classNameProp}`;

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

    const imageElement =
        url !== null ? <img className={styles.image} src={url} /> :
        null;

    return (
        <div {...{ className }}>
            {imageElement}
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/image-viewer': {
            viewerControllerFactory: ImageViewerControllerFactory;
        };
    }
}
