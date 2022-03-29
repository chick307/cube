import React from 'react';

import type { Entry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { Size } from '../../../common/values/size';
import type { PdfViewerDirection, PdfViewerPageDisplay, PdfViewerState } from '../../../common/values/viewer-state';
import type { HistoryController } from '../../controllers/history-controller';
import type { PdfViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useKeyDown } from '../../hooks/use-key-down';
import { useRestate } from '../../hooks/use-restate';
import { useService } from '../../hooks/use-service';
import { useTask } from '../../hooks/use-task';
import { StatusBarSelect } from '../status-bar/status-bar-select';
import { StatusBarSpace } from '../status-bar/status-bar-space';
import styles from './pdf-viewer.module.css';

export type Props = {
    className?: string;

    entry: Entry;

    fileSystem: FileSystem;

    viewerState: PdfViewerState;
};

export const PdfViewer = (props: Props) => {
    const {
        className: classNameProp,
        entry,
        fileSystem,
        viewerState,
    } = props;

    const historyController = useService('historyController');
    const viewerControllerFactory = useService('viewerControllerFactory');

    const viewerController = React.useMemo(() => {
        return viewerControllerFactory.createPdfViewerController({ historyController });
    }, [viewerControllerFactory]);

    viewerController.initialize({ entry, fileSystem, viewerState });

    const StatusBarGateway = useStatusBarGateway();

    const {
        currentPageNumbers,
        currentSpread,
        direction,
        documentDirection,
        numberOfPages,
        pageDisplay,
    } = useRestate(viewerController.state);

    const className = classNameProp == null ? styles.pdfViewer : `${styles.pdfViewer} ${classNameProp}`;

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [containerSize, setContainerSize] = React.useState(new Size({ width: 0, height: 0 }));

    const resizeObserver = React.useMemo(() => new ResizeObserver((entries) => {
        const size = new Size(entries[0].contentRect).scale(devicePixelRatio);
        setContainerSize((previousSize) => size.equals(previousSize) ? previousSize : size);
    }), []);

    React.useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const container = canvas.offsetParent as HTMLElement;
        resizeObserver.observe(container);
        return () => {
            resizeObserver.unobserve(container);
        };
    }, []);

    useTask(async (signal) => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const imageSource = await viewerController.renderSpread({ containerSize, spread: currentSpread, signal });
        if (imageSource === null) {
            canvas.width = 0;
            canvas.height = 0;
            return;
        }

        canvas.width = imageSource.width;
        canvas.height = imageSource.height;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.drawImage(imageSource, 0, 0);
    }, [containerSize, currentSpread?.id, viewerController]);

    const pageNumbers = `${currentPageNumbers?.join(', ') ?? '-'} / ${numberOfPages || '-'}`;

    const directionOptions = StatusBarSelect.useOptions<PdfViewerDirection>(() => [
        { label: documentDirection === 'R2L' ? 'Right to Left (File)' : 'Left to Right (File)', value: null },
        { label: 'Left to Right', value: 'L2R' },
        { label: 'Right to Left', value: 'R2L' },
    ], [documentDirection]);

    const onDirectionChange = React.useCallback((value: PdfViewerDirection) => {
        viewerController.setDirection(value);
    }, [viewerController]);

    const pageDisplayOptions = StatusBarSelect.useOptions<PdfViewerPageDisplay>(() => [
        { label: 'Single Page', value: 'single' },
        { label: 'Two Pages', value: 'two' },
    ], []);

    const onPageDisplayChange = React.useCallback((value: PdfViewerPageDisplay) => {
        viewerController.setPageDisplay(value);
    }, [viewerController]);

    useKeyDown((e) => {
        switch (e.key) {
            case 'ArrowDown': {
                viewerController.openNextPage();
                return;
            }
            case 'ArrowLeft': {
                viewerController.openLeftPage();
                return;
            }
            case 'ArrowRight': {
                viewerController.openRightPage();
                return;
            }
            case 'ArrowUp': {
                viewerController.openPreviousPage();
                return;
            }
            case 'End': {
                viewerController.openLastPage();
                return;
            }
            case 'Home': {
                viewerController.openFirstPage();
                return;
            }
        }
    }, [viewerController]);

    return (
        <div {...{ className }}>
            <canvas ref={canvasRef} className={styles.pdfCanvas} />
            <StatusBarGateway>
                <StatusBarSpace />
                <div>
                    {pageNumbers}
                </div>
                <StatusBarSpace />
                <StatusBarSelect value={pageDisplay} onChange={onPageDisplayChange} options={pageDisplayOptions} />
                <StatusBarSelect value={direction} onChange={onDirectionChange} options={directionOptions} />
            </StatusBarGateway>
        </div>
    );
};

declare module '../../hooks/use-service' {
    interface Services {
        'components/viewers/pdf-viewer': {
            historyController: HistoryController;

            viewerControllerFactory: PdfViewerControllerFactory;
        };
    }
}
