import React from 'react';

import { DirectoryEntry } from '../../../common/entities/directory-entry';
import type { FileEntry } from '../../../common/entities/file-entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { ZipFileSystem } from '../../../common/entities/zip-file-system';
import { EntryPath } from '../../../common/values/entry-path';
import { useEntryService } from '../../contexts/entry-service-context';
import { useTask } from '../../hooks/use-task';
import styles from './comic-entry-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

const rootDirectoryEntry = new DirectoryEntry(new EntryPath('/'));

export const ComicEntryView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const entryService = useEntryService();

    const zipFileSystem = React.useMemo(() => {
        const zipFileSystem = new ZipFileSystem({ container: { entry, fileSystem } });
        return zipFileSystem;
    }, [entry, fileSystem]);

    const [pages] = useTask(async (signal) => {
        const pages: FileEntry[] = [];
        const getPages = async (directoryEntry: DirectoryEntry) => {
            const entries = await entryService.readDirectory({
                entry: directoryEntry,
                fileSystem: zipFileSystem,
            }, {
                signal,
            });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    await signal.wrapPromise(getPages(entry));
                } else if (entry.isFile() && /^\.(?:jpe?g|png)$/.test(entry.path.getExtension())) {
                    pages.push(entry);
                }
            }
        };
        await getPages(rootDirectoryEntry);
        return pages;
    }, [zipFileSystem]);

    const spreads = React.useMemo(() => {
        if (pages == null)
            return;
        if (pages.length === 0)
            return;
        const spreads: ([FileEntry] | [FileEntry, FileEntry])[] = [[pages[0]]];
        const length = Math.ceil((pages.length - 1) / 2) + 1;
        for (let i = 1; i < length; i++)
            spreads.push(i * 2 < pages.length ? [pages[i * 2 - 1], pages[i * 2]] : [pages[i * 2 - 1]]);
        return spreads;
    }, [pages]);

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
    }, [pages]);

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
            const buffer = await entryService.readFile({
                entry: fileEntry,
                fileSystem: zipFileSystem,
            }, {
                signal,
            });
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

    return (
        <div className={`${className} ${styles.view}`}>
            <canvas className={styles.canvas} ref={canvasRef} />
        </div>
    );
};

export const isComicEntry = (entry: FileEntry) =>
    /^\.(?:cbz)$/.test(entry.path.getExtension());
