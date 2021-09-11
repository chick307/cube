import * as pdfjs from 'pdfjs-dist';
import React from 'react';

import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import {
    PdfViewerDirection,
    PdfViewerPageDisplay,
    PdfViewerState,
} from '../../../common/values/viewer-state/pdf-viewer-state';
import { useHistoryController } from '../../contexts/history-controller-context';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useBlobUrl } from '../../hooks/use-blob-url';
import { useTask } from '../../hooks/use-task';
import { StatusBarSelect } from '../status-bar/status-bar-select';
import { StatusBarSpace } from '../status-bar/status-bar-space';
import styles from './pdf-entry-view.css';

const CMAP_URL = './cmaps/';
const CMAP_PACKED = true;

export type Props = {
    className?: string;
    direction: PdfViewerDirection;
    entry: FileEntry;
    fileSystem: FileSystem;
    pageDisplay: PdfViewerPageDisplay;
};

type PdfDocumentProxy = ReturnType<typeof pdfjs.getDocument>['promise'] extends Promise<infer T> ? T : never;

type PdfPageProxy = ReturnType<PdfDocumentProxy['getPage']> extends Promise<infer T> ? T : never;

const docCache = new WeakMap<PdfDocumentProxy, {
    pages: {
        [index: number]: undefined | {
            page?: PdfPageProxy;
            pagePromise?: Promise<PdfPageProxy>;
        };
    };
}>();

export const PdfEntryView = (props: Props) => {
    const { className = '', entry, fileSystem, direction: selectedDirection, pageDisplay } = props;

    const historyController = useHistoryController();

    const StatusBarGateway = useStatusBarGateway();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [currentSpreadIndex, setCurrentSpreadIndex] = React.useState(0);

    const url = useBlobUrl({ entry, fileSystem, type: 'application/pdf' });

    const [doc = null] = useTask(async (signal) => {
        if (url === null)
            return;
        const doc = await signal.wrapPromise(pdfjs.getDocument({
            url,
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED,
        }).promise);
        return doc;
    }, [url]);

    const spreads = React.useMemo(() => {
        if (doc === null)
            return [];
        const length = pageDisplay === 'single' ? doc.numPages : Math.ceil((doc.numPages + 1) / 2);
        const spreads = Array.from(
            new Array(length),
            pageDisplay === 'single' ? (
                (_, index) => [index + 1]
            ) : (
                (_, index) => (
                    index * 2 + 2 < doc.numPages ? [index * 2 + 1, index * 2 + 2] :
                    [index * 2 + 1]
                )
            ),
        );
        return spreads;
    }, [doc, pageDisplay]);

    const [spread = null] = useTask(async (signal) => {
        if (doc === null)
            return;
        if (!docCache.has(doc))
            docCache.set(doc, { pages: {} });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cache = docCache.get(doc)!;
        return Promise.all(spreads[currentSpreadIndex].map(async (pageNumber) => {
            const pageCache = cache.pages[pageNumber] ??= {};
            if (pageCache.page != null)
                return pageCache.page;
            const pagePromise = pageCache.pagePromise ??= doc.getPage(pageNumber);
            const page = pageCache.page = await signal.wrapPromise(pagePromise);
            return page;
        }));
    }, [doc, currentSpreadIndex, pageDisplay]);

    const [pref = null] = useTask(async (signal) => {
        if (doc === null)
            return;
        const pref = await signal.wrapPromise(doc.getViewerPreferences());
        return pref as null | {
            /* eslint-disable @typescript-eslint/naming-convention */
            Direction?: string;
            /* eslint-enable */
        };
    }, [doc]);

    const direction = selectedDirection ?? (pref?.Direction as 'L2R' | 'R2L' | null) ?? 'L2R';

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (spread === null || canvas === null)
            return;
        const viewports = spread.map((page) => page.getViewport({ scale: devicePixelRatio }));
        const height = viewports.reduce((height, viewport) => Math.max(height, viewport.height), 0);
        const widthList = viewports.map((viewport) => Math.round(viewport.width * height / viewport.height));
        const width = widthList.reduce((width, w) => width + w, 0);
        const tasks = [] as Promise<HTMLCanvasElement>[];
        const cleanup = spread.map((page, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = widthList[index];
            canvas.height = height;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const ctx = canvas.getContext('2d')!;
            const viewport = viewports[index];
            const scale = height / viewport.height;
            ctx.scale(scale, scale);
            const task = page.render({ canvasContext: ctx, viewport });
            tasks.push(task.promise.then(() => canvas));
            return () => {
                task.cancel();
            };
        });
        Promise.all(tasks).then((canvases) => {
            canvas.width = width;
            canvas.height = height;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const context = canvas.getContext('2d')!;
            for (const c of direction === 'L2R' ? canvases : canvases.reverse()) {
                context.drawImage(c, 0, 0);
                context.translate(c.width, 0);
            }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        }, () => {}); // catch rendering cancelled excepction
        return () => {
            for (const c of cleanup)
                c();
        };
    }, [canvasRef.current, direction, doc, spread, pageDisplay]);

    React.useEffect(() => {
        if (doc === null)
            return;

        const [nextPageKey, prevPageKey] =
            direction === 'R2L' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'End') {
                setCurrentSpreadIndex(() => Math.max(spreads.length - 1, 0));
            } else if (e.key === 'Home') {
                setCurrentSpreadIndex(() => 0);
            } else if (e.key === nextPageKey || e.key === 'ArrowDown') {
                setCurrentSpreadIndex((n) => Math.min(n + 1, spreads.length - 1));
            } else if (e.key === 'ArrowUp' || e.key === prevPageKey) {
                setCurrentSpreadIndex((n) => Math.max(n - 1, 0));
            }
        };

        document.addEventListener('keydown', onKeyDown, false);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [direction, spreads]);

    const directionOptions = StatusBarSelect.useOptions<PdfViewerDirection>(() => [
        { label: pref?.Direction === 'R2L' ? 'Right to Left (File)' : 'Left to Right (File)', value: null },
        { label: 'Left to Right', value: 'L2R' },
        { label: 'Right to Left', value: 'R2L' },
    ], [pref]);

    const selectDirection = React.useCallback((direction: PdfViewerDirection) => {
        const viewerState = new PdfViewerState({ direction, pageDisplay });
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        historyController.replace(historyItem);
    }, [entry, fileSystem, historyController, pageDisplay]);

    const pageDisplayOptions = StatusBarSelect.useOptions<PdfViewerPageDisplay>(() => [
        { label: 'Single Page', value: 'single' },
        { label: 'Two Pages', value: 'two' },
    ], [pref]);

    const selectPageDisplay = React.useCallback((pageDisplay: PdfViewerPageDisplay) => {
        const viewerState = new PdfViewerState({ direction: selectedDirection, pageDisplay });
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        historyController.replace(historyItem);
    }, [selectedDirection, entry, fileSystem, historyController]);

    return (
        <div className={`${className} ${styles.view}`}>
            <canvas className={styles.canvas} ref={canvasRef} />
            <StatusBarGateway>
                <StatusBarSpace />
                <StatusBarSelect value={pageDisplay} onChange={selectPageDisplay} options={pageDisplayOptions} />
                <StatusBarSelect value={selectedDirection} onChange={selectDirection} options={directionOptions} />
            </StatusBarGateway>
        </div>
    );
};
