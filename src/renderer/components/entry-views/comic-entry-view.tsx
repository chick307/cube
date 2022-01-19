import React from 'react';

import type { DirectoryEntry, FileEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { HistoryItem } from '../../../common/entities/history-item';
import { ComicViewerPageDisplay, ComicViewerState } from '../../../common/values/viewer-state/comic-viewer-state';
import { useEntryService } from '../../contexts/entry-service-context';
import { useHistoryController } from '../../contexts/history-controller-context';
import { useStatusBarGateway } from '../../gateways/status-bar-gateway';
import { useTask } from '../../hooks/use-task';
import { EntryDraggable, EntryDragImage } from '../entry/entry-draggable';
import { EntryIcon } from '../entry/entry-icon';
import { StatusBarSelect } from '../status-bar/status-bar-select';
import { StatusBarSpace } from '../status-bar/status-bar-space';
import styles from './comic-entry-view.css';

export type Props = {
    className?: string;
    entry: DirectoryEntry;
    fileSystem: FileSystem;
    pageDisplay: ComicViewerPageDisplay;
};

export const ComicEntryView = (props: Props) => {
    const { className = '', entry, fileSystem, pageDisplay } = props;

    const historyController = useHistoryController();
    const entryService = useEntryService();
    const StatusBarGateway = useStatusBarGateway();

    const [pages] = useTask(async (signal) => {
        const pages: FileEntry[] = [];
        const getPages = async (directoryEntry: DirectoryEntry) => {
            const entries = await entryService.readDirectory({ entry: directoryEntry, fileSystem, signal });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    await signal.wrapPromise(getPages(entry));
                } else if (entry.isFile() && /^\.(?:jpe?g|png)$/.test(entry.path.getExtension())) {
                    pages.push(entry);
                }
            }
        };
        await signal.wrapPromise(getPages(entry));
        return pages;
    }, [entry, entryService, fileSystem]);

    const spreads = React.useMemo(() => {
        if (pages == null)
            return;
        if (pages.length === 0)
            return;
        if (pageDisplay === 'single')
            return pages.map((entry) => [entry]);
        const spreads: ([FileEntry] | [FileEntry, FileEntry])[] = [[pages[0]]];
        const length = Math.ceil((pages.length - 1) / 2) + 1;
        for (let i = 1; i < length; i++)
            spreads.push(i * 2 < pages.length ? [pages[i * 2 - 1], pages[i * 2]] : [pages[i * 2 - 1]]);
        return spreads;
    }, [pages, pageDisplay]);

    const [currentSpreadIndex, setCurrentSpreadIndex] = React.useState<number>(() => 0);

    const currentSpread = React.useMemo(() => spreads && spreads[currentSpreadIndex], [spreads, currentSpreadIndex]);

    React.useEffect(() => {
        if (spreads == null)
            return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'End') {
                setCurrentSpreadIndex(() => Math.max(spreads.length - 1, 0));
            } else if (e.key === 'Home') {
                setCurrentSpreadIndex(() => 0);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                setCurrentSpreadIndex((n) => Math.min(n + 1, spreads.length - 1));
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                setCurrentSpreadIndex((n) => Math.max(n - 1, 0));
            }
        };

        document.addEventListener('keydown', onKeyDown, false);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [spreads]);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useTask(async (signal) => {
        const canvas = canvasRef.current;
        if (canvas == null)
            return;
        if (currentSpread == null) {
            canvas.width = 0;
            canvas.height = 0;
            return;
        }
        const loadImage = async (fileEntry: FileEntry) => {
            const buffer = await entryService.readFile({ entry: fileEntry, fileSystem }, { signal });
            const extension = fileEntry.path.getExtension();
            const type = extension === '.png' ? 'image/png' : 'image/jpeg';
            const blob = new Blob([buffer], { type });
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.src = url;
            await signal.wrapPromise(new Promise<void>((resolve, reject) => {
                image.onload = () => {
                    resolve();
                };
                image.onerror = () => {
                    reject(Error());
                };
            }).finally(() => {
                URL.revokeObjectURL(url);
            }));
            return image;
        };
        const images = await signal.wrapPromise(Promise.all(currentSpread.map(loadImage)));
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
        const viewerState = new ComicViewerState({ pageDisplay: value as ComicViewerPageDisplay });
        const newHistoryItem = new HistoryItem({ entry, fileSystem, viewerState });
        historyController.replace(newHistoryItem);
        if (viewerState.pageDisplay === 'single') {
            if (pageDisplay === 'two') {
                setCurrentSpreadIndex((index) => Math.max(index * 2 - 1, 0));
            }
        } else if (viewerState.pageDisplay === 'two') {
            if (pageDisplay === 'single') {
                setCurrentSpreadIndex((index) => (index + 1) >>> 1);
            }
        }
    }, [entry, fileSystem, historyController, pageDisplay]);

    const pageDisplayOptions = StatusBarSelect.useOptions<ComicViewerPageDisplay>(() => [
        { label: 'Single Page', value: 'single' },
        { label: 'Two Pages', value: 'two' },
    ], []);

    const currentPages = React.useMemo(() => {
        if (currentSpread == null)
            return '-';
        const currentPages = currentSpread.map((entry, index) => {
            return (
                <EntryDraggable {...{ fileSystem }} key={index} path={entry.path} type={entry.type}>
                    <div className={styles.entryNameContainer}>
                        <EntryDragImage className={styles.dragImage} offsetX={8} offsetY={8}>
                            <EntryIcon {...{ entryPath: entry.path, fileSystem }} />
                            <span className={styles.entryNameText}>{entry.name.toString()}</span>
                        </EntryDragImage>
                    </div>
                </EntryDraggable>
            );
        });
        return currentPages.reverse();
    }, [currentSpread, fileSystem]);

    return (
        <div className={`${className} ${styles.view}`}>
            <canvas className={styles.canvas} ref={canvasRef} />
            <StatusBarGateway>
                <StatusBarSpace />
                <div>
                    {currentPages}
                </div>
                <StatusBarSpace />
                <StatusBarSelect value={pageDisplay} onChange={onPageDisplaySelected} options={pageDisplayOptions} />
            </StatusBarGateway>
        </div>
    );
};
