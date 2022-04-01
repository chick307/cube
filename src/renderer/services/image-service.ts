import { FileEntry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { CloseSignal } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import { EntryService } from './entry-service';

export type ImageService = {
    loadBlob(prams: LoadBlobParams): Promise<Blob>;

    loadImage(prams: LoadImageParams): Promise<HTMLImageElement>;
};

export type LoadBlobParams = {
    readonly entryPath: EntryPath;

    readonly fileSystem: FileSystem;

    readonly signal?: CloseSignal | null | undefined;
};

export type LoadImageParams = {
    readonly entryPath: EntryPath;

    readonly fileSystem: FileSystem;

    readonly signal?: CloseSignal | null | undefined;
};

export class ImageServiceImpl implements ImageService {
    #entryService: EntryService;

    constructor(params: {
        readonly entryService: EntryService;
    }) {
        this.#entryService = params.entryService;
    }

    #getMediaType(entryPath: EntryPath): string | undefined {
        const extension = entryPath.getExtension().toLowerCase();
        switch (extension) {
            case '.gif': return 'image/gif';
            case '.ico': return 'image/vnd.microsoft.icon';
            case '.jpg': case '.jpeg': return 'image/jpeg';
            case '.png': return 'image/png';
            case '.svg': return 'image/svg+xml';
            case '.webp': return 'image/webp';
            default: return undefined;
        }
    }

    async loadBlob(params: LoadBlobParams): Promise<Blob> {
        const { entryPath, fileSystem, signal } = params;
        const entry = await this.#entryService.createEntryFromPath({ entryPath, fileSystem, signal });
        if (entry === null)
            throw Error();
        const buffer = await this.#entryService.readFile({ entry: entry as FileEntry, fileSystem, signal });
        const type = this.#getMediaType(entryPath);
        const blob = new Blob([buffer], { type });
        return blob;
    }

    async loadImage(params: LoadImageParams): Promise<HTMLImageElement> {
        const { signal } = params;
        const blob = await this.loadBlob(params);
        const url = URL.createObjectURL(blob);
        const image = new Image();
        const promise = new Promise<void>((resolve, reject) => {
            image.src = url;
            image.onload = () => resolve();
            image.onerror = () => reject(Error());
        });
        await (signal?.wrapPromise(promise) ?? promise);
        return image;
    }
}
