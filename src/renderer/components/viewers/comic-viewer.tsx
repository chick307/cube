import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import type { ComicViewerPageDisplay, ComicViewerState } from '../../../common/values/viewer-state/comic-viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import type { ComicViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useKeyDown } from '../../hooks/use-key-down';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import { EntryDraggable, EntryDragImage } from '../entry/entry-draggable';
import { EntryIcon } from '../entry/entry-icon';
import { StatusBarSelect } from '../status-bar/status-bar-select';
import { StatusBarSpace } from '../status-bar/status-bar-space';
import styles from './comic-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: ComicViewerState;
};

export const ComicViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const comicViewerControllerFactory = useService('viewerControllerFactory');
    const StatusBarGateway = useStatusBarGateway();

    const comicViewerController = React.useMemo(() => {
        return comicViewerControllerFactory.createComicViewerController({
            historyController,
        });
    }, [comicViewerControllerFactory, historyController]);

    comicViewerController.initialize({ entry, fileSystem, viewerState });

    const {
        currentSpread,
        pageDisplay,
    } = useRestate(comicViewerController.state);

    useKeyDown((e) => {
        switch (e.key) {
            case 'ArrowLeft': {
                comicViewerController.openLeftPage();
                return;
            }
            case 'ArrowDown': {
                comicViewerController.openNextPage();
                return;
            }
            case 'ArrowUp': {
                comicViewerController.openPreviousPage();
                return;
            }
            case 'ArrowRight': {
                comicViewerController.openRightPage();
                return;
            }
            case 'End': {
                comicViewerController.openLastPage();
                return;
            }
            case 'Home': {
                comicViewerController.openFirstPage();
                return;
            }
        }
    }, [comicViewerController]);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        if (currentSpread == null) {
            canvas.width = 0;
            canvas.height = 0;
            return;
        }
        if (currentSpread.pages.some((page) => page.image === null))
            return;
        const images = currentSpread.pages.map((page) => page.image as HTMLImageElement);
        const height = images.map((image) => image.height).reduce((a, b) => a < b ? b : a);
        const width = images.map((image) => Math.floor(image.width * height / image.height)).reduce((a, b) => a + b);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        let x = width;
        for (const image of images) {
            const w = Math.floor(image.width * height / image.height);
            x -= w;
            ctx.drawImage(image, x, 0, w, height);
        }
    }, [currentSpread]);

    const onPageDisplaySelected = React.useCallback((value: ComicViewerPageDisplay) => {
        comicViewerController.setPageDisplay(value);
    }, [comicViewerController]);

    const pageDisplayOptions = StatusBarSelect.useOptions<ComicViewerPageDisplay>(() => [
        { label: 'Single Page', value: 'single' },
        { label: 'Two Pages', value: 'two' },
    ], []);

    const currentPages = React.useMemo(() => {
        if (currentSpread == null)
            return '-';
        const currentPages = currentSpread.pages.map(({ entry }, index) => {
            return (
                <EntryDraggable key={index} className={styles.entryNameContainer}
                    {...{ fileSystem }} path={entry.path} type={entry.type}>
                    <EntryDragImage className={styles.dragImage} offsetX={8} offsetY={8}>
                        <EntryIcon {...{ entryPath: entry.path, fileSystem }} />
                        <span className={styles.entryNameText}>{entry.name.toString()}</span>
                    </EntryDragImage>
                </EntryDraggable>
            );
        });
        return currentPages.reverse();
    }, [currentSpread, fileSystem]);

    const className = classNameProp == null ? styles.comicViewer : `${styles.comicViewer} ${classNameProp}`;

    return (
        <div {...{ className }}>
            <canvas className={styles.canvas} ref={canvasRef} />
            <StatusBarGateway>
                <StatusBarSpace />
                <div>
                    {currentPages}
                </div>
                <StatusBarSpace />
                <StatusBarSelect className={styles.pageDisplaySelect}
                    value={pageDisplay} onChange={onPageDisplaySelected} options={pageDisplayOptions} />
            </StatusBarGateway>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/comic-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: ComicViewerControllerFactory;
        };
    }
}
