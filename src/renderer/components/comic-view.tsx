import React from 'react';

import { DirectoryEntry } from '../../common/entities/directory-entry';
import { FileEntry } from '../../common/entities/file-entry';
import { useTask } from '../hooks/use-task';
import { FileSystem } from '../services/file-system';
import { ZipFileSystemService } from '../services/zip-file-system-service';
import styles from './comic-view.css';

export type Props = {
    className?: string;
    entry: FileEntry;
    fileSystem: FileSystem;
};

export const ComicView = (props: Props) => {
    const { className = '', entry, fileSystem } = props;

    const zipFileSystem = React.useMemo(() => {
        const zipFileSystem = new ZipFileSystemService({ zipFileEntry: entry, zipFileSystem: fileSystem });
        return zipFileSystem;
    }, [entry, fileSystem]);

    const [pages] = useTask(async (context) => {
        const pages: FileEntry[] = [];
        const getPages = async (directoryEntry: DirectoryEntry) => {
            const entries = await context.wrapPromise(zipFileSystem.readDirectory(directoryEntry));
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    await context.wrapPromise(getPages(entry));
                } else if (entry.isFile() && /^\.(?:jpe?g|png)$/.test(entry.path.getExtension())) {
                    pages.push(entry);
                }
            }
        };
        await getPages(zipFileSystem.getRoot());
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
            if (e.keyCode === 35) {
                // end
                setCurrentSpreadIndex(() => Math.max(spreads.length - 1, 0));
            } else if (e.keyCode === 36) {
                // home
                setCurrentSpreadIndex(() => 0);
            } else if (e.keyCode === 37 || e.keyCode === 40) {
                // left key or down key
                setCurrentSpreadIndex((n) => Math.min(n + 1, spreads.length - 1));
            } else if (e.keyCode === 38 || e.keyCode === 39) {
                // up key or right key
                setCurrentSpreadIndex((n) => Math.max(n - 1, 0));
            }
        };

        document.addEventListener('keydown', onKeyDown, false);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [pages]);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useTask(async (context) => {
        const canvas = canvasRef.current;
        if (canvas == null)
            return;
        if (currentSpread == null) {
            canvas.width = 0;
            canvas.height = 0;
            return;
        }
        const loadImage = async (fileEntry: FileEntry) => {
            const buffer = await context.wrapPromise(zipFileSystem.readFile(fileEntry));
            const extension = fileEntry.path.getExtension();
            const type = extension === '.png' ? 'image/png' : 'image/jpeg';
            const blob = new Blob([buffer], { type });
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.src = url;
            await context.wrapPromise(new Promise<void>((resolve, reject) => {
                image.onload = () => { resolve(); };
                image.onerror = () => { reject(Error()); };
            }).finally(() => {
                URL.revokeObjectURL(url);
            }));
            return image;
        };
        const images = await context.wrapPromise(Promise.all(currentSpread.map(loadImage)));
        const height = images.map((image) => image.height).reduce((a, b) => a < b ? b : a);
        const width = images.map((image) => Math.floor(image.width * height / image.height)).reduce((a, b) => a + b);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        let x = width;
        for (const image of images) {
            const w = Math.floor(image.width * height / image.height);
            x -= w;
            ctx.drawImage(image, x, 0, w, height);
        }
    }, [currentSpread]);

    return <>
        <div className={`${className} ${styles.view}`}>
            <canvas className={styles.canvas} ref={canvasRef} />
        </div>
    </>;
};

export const isComicEntry = (entry: FileEntry) =>
    /^\.(?:cbz)$/.test(entry.path.getExtension());
