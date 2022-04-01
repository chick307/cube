import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { Point } from '../../../common/values/point';
import type { ImageViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
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

    const historyController = useService('historyController');

    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createImageViewerController({ historyController });
    }, [historyController, viewerControllerFactory]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const viewerElementRef = React.useRef<HTMLDivElement>(null);

    const {
        blob,
        scrollPosition,
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

    const imageElement = React.useMemo(() => {
        if (url === null)
            return null;
        const onLoad = () => {
            // restore scroll position
            const viewerElement = viewerElementRef.current as HTMLDivElement;
            const container = viewerElement?.offsetParent as HTMLElement | null | undefined;
            if (container == null)
                return;
            container.scrollTo(scrollPosition.x, scrollPosition.y);
        };
        return <img className={styles.image} src={url} {...{ onLoad }} />;
    }, [url]);

    // save scroll position
    React.useEffect(() => {
        const viewerElement = viewerElementRef.current as HTMLDivElement;
        const container = viewerElement?.offsetParent as HTMLElement | null | undefined;
        if (container == null)
            return;

        let saving: ReturnType<typeof setTimeout> | null = null;

        const handleScroll = () => {
            if (saving !== null)
                clearTimeout(saving);
            saving = setTimeout(() => {
                const position = new Point(container.scrollLeft, container.scrollTop);
                viewerController.scrollTo({ position });
            }, 100);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (saving != null)
                clearTimeout(saving);
        };
    }, [viewerController]);

    return (
        <div ref={viewerElementRef} {...{ className }}>
            {imageElement}
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/image-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: ImageViewerControllerFactory;
        };
    }
}
