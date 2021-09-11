import * as pdfjs from 'pdfjs-dist';
import React from 'react';

import type { FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { PdfViewerDirection, PdfViewerState } from '../../../common/values/viewer-state/pdf-viewer-state';
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
    const { className = '', entry, fileSystem, direction: selectedDirection } = props;

    const historyController = useHistoryController();

    const StatusBarGateway = useStatusBarGateway();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [currentPageIndex, setCurrentPageIndex] = React.useState(0);

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

    const [page = null] = useTask(async (signal) => {
        if (doc === null)
            return;
        if (!docCache.has(doc))
            docCache.set(doc, { pages: {} });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cache = docCache.get(doc)!;
        const pageCache = cache.pages[currentPageIndex] ??= {};
        if (pageCache.page != null)
            return pageCache.page;
        const pagePromise = pageCache.pagePromise ??= doc.getPage(currentPageIndex + 1);
        const page = pageCache.page = await signal.wrapPromise(pagePromise);
        return page;
    }, [doc, currentPageIndex]);

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
        if (page === null || canvas === null)
            return;
        const viewport = page.getViewport({ scale: devicePixelRatio });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const context = canvas.getContext('2d')!;
        const task = page.render({ canvasContext: context, viewport });
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            task.promise.catch(() => {}); // catch rendering cancelled exception
            task.cancel();
        };
    }, [canvasRef.current, page]);

    React.useEffect(() => {
        if (doc === null)
            return;

        const [nextPageKey, prevPageKey] =
            direction === 'R2L' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'End') {
                setCurrentPageIndex(() => Math.max(doc.numPages - 1, 0));
            } else if (e.key === 'Home') {
                setCurrentPageIndex(() => 0);
            } else if (e.key === nextPageKey || e.key === 'ArrowDown') {
                setCurrentPageIndex((n) => Math.min(n + 1, doc.numPages - 1));
            } else if (e.key === 'ArrowUp' || e.key === prevPageKey) {
                setCurrentPageIndex((n) => Math.max(n - 1, 0));
            }
        };

        document.addEventListener('keydown', onKeyDown, false);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [direction, doc]);

    const directionOptions = StatusBarSelect.useOptions<'L2R' | 'R2L' | null>(() => [
        { label: pref?.Direction === 'R2L' ? 'Right to Left (File)' : 'Left to Right (File)', value: null },
        { label: 'Left to Right', value: 'L2R' },
        { label: 'Right to Left', value: 'R2L' },
    ], [pref]);

    const selectDirection = React.useCallback((direction: PdfViewerDirection) => {
        const viewerState = new PdfViewerState({ direction });
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        historyController.replace(historyItem);
    }, [entry, fileSystem, historyController]);

    return (
        <div className={`${className} ${styles.view}`}>
            <canvas className={styles.canvas} ref={canvasRef} />
            <StatusBarGateway>
                <StatusBarSpace />
                <StatusBarSelect value={selectedDirection} onChange={selectDirection} options={directionOptions} />
            </StatusBarGateway>
        </div>
    );
};
