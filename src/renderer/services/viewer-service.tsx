import { DirectoryEntry, Entry, FileEntry, SymbolicLinkEntry } from '../../common/entities/entry';
import { FileSystem, ZipFileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseSignal } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import * as ViewerStates from '../../common/values/viewer-state';
import * as EntryViews from '../components/entry-views';
import type { EntryService } from './entry-service';

export type ViewerService = {
    prioritizeViewers(
        params: PrioritizeViewersParameters,
        options?: PrioritizeViewersOptions,
    ): Promise<Viewer[]>;

    selectViewer(
        params: SelectViewerParameters,
    ): Viewer | null;
};

export type PrioritizeViewersParameters = {
    entry: Entry;
    fileSystem: FileSystem;
};

export type PrioritizeViewersOptions = {
    signal?: CloseSignal | null;
};

export type RedirectParameters = {
    historyItem: HistoryItem;
    viewer: Viewer;
};

export type SelectViewerParameters = {
    historyItem: HistoryItem;
    viewers: Viewer[];
};

export type Viewer = {
    id: string;
    name: string;
    canRender(historyItem: HistoryItem): boolean;
    redirect(historyItem: HistoryItem): HistoryItem;
    render(historyItem: HistoryItem): React.ReactNode;
};

const rootDirectory = new DirectoryEntry(new EntryPath('/'));

const symbolicLinkViewer: Viewer = {
    id: 'symbolic-link',
    name: 'Symbolic Link',
    canRender: (historyItem) => historyItem.viewerState?.type === 'symbolic-link',
    redirect: (historyItem) => {
        const viewerState = new ViewerStates.SymbolicLinkViewerState();
        return new HistoryItem({ ...historyItem, viewerState });
    },
    render({ entry, fileSystem }: HistoryItem) {
        if (!entry.isSymbolicLink())
            return null;
        return <EntryViews.SymbolicLinkEntryView {...{ entry: entry as SymbolicLinkEntry, fileSystem }} />;
    },
};

const directoryViewer: Viewer = {
    id: 'directory',
    name: 'Directory',
    canRender: (historyItem) => historyItem.viewerState?.type === 'directory',
    redirect: (historyItem) => {
        const viewerState = new ViewerStates.DirectoryViewerState();
        return new HistoryItem({ ...historyItem, viewerState });
    },
    render({ entry, fileSystem }: HistoryItem) {
        if (!entry.isDirectory() && !entry.isSymbolicLink())
            return null;
        return <EntryViews.DirectoryEntryView {...{ entry: entry as DirectoryEntry, fileSystem }} />;
    },
};

const comicViewer: Viewer = {
    id: 'comic',
    name: 'Comic',
    canRender: (historyItem) => historyItem.viewerState?.type === 'comic',
    redirect: (historyItem) => {
        const viewerState = new ViewerStates.ComicViewerState();
        return new HistoryItem({ ...historyItem, viewerState });
    },
    render(historyItem) {
        if (!historyItem.entry.isDirectory() && !historyItem.entry.isSymbolicLink())
            return null;
        const entry = historyItem.entry as DirectoryEntry;
        const { fileSystem } = historyItem;
        const viewerState = historyItem.viewerState as ViewerStates.ComicViewerState;
        const pageDisplay = viewerState.pageDisplay;
        return <EntryViews.ComicEntryView {...{ entry, fileSystem, pageDisplay }} />;
    },
};

const zipViewer: Viewer = {
    id: 'zip',
    name: 'Zip',
    canRender: (historyItem) => historyItem.viewerState?.type === 'directory',
    redirect: (historyItem) => {
        const viewerState = new ViewerStates.DirectoryViewerState();
        return new HistoryItem({ ...historyItem, viewerState });
    },
    render({ entry, fileSystem }: HistoryItem) {
        if (!entry.isDirectory() && !entry.isSymbolicLink())
            return null;
        return <EntryViews.DirectoryEntryView {...{ entry: entry as DirectoryEntry, fileSystem }} />;
    },
};

const createFileViewer = (params: {
    id?: string | null;
    name: string;
    viewerStateType?: string | null;
    viewerStateFactory: () => ViewerStates.ViewerState;
    render: (historyItem: HistoryItem & { entry: FileEntry; }) => { node: React.ReactNode; };
}): Viewer => {
    const { name } = params;
    const id = params.id ?? name.toLowerCase();
    const viewerStateType = params.viewerStateType ?? id;
    return {
        id,
        name,
        canRender: (historyItem) => historyItem.viewerState?.type === viewerStateType,
        redirect: (historyItem) => {
            const viewerState = params.viewerStateFactory();
            return new HistoryItem({ ...historyItem, viewerState });
        },
        render: (historyItem) => {
            if (historyItem.entry.isFile() || historyItem.entry.isSymbolicLink())
                return params.render(historyItem as HistoryItem & { entry: FileEntry; }).node;
            return null;
        },
    };
};

const binaryViewer = createFileViewer({
    name: 'Binary',
    viewerStateFactory: () => new ViewerStates.BinaryViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.BinaryEntryView {...{ entry, fileSystem }} /> }),
});

const cssViewer = createFileViewer({
    name: 'CSS',
    viewerStateFactory: () => new ViewerStates.CssViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.CssEntryView {...{ entry, fileSystem }} /> }),
});

const imageViewer = createFileViewer({
    name: 'Image',
    viewerStateFactory: () => new ViewerStates.ImageViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.ImageEntryView {...{ entry, fileSystem }} /> }),
});

const javascriptViewer = createFileViewer({
    name: 'JavaScript',
    viewerStateFactory: () => new ViewerStates.JavaScriptViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.JavaScriptEntryView {...{ entry, fileSystem }} /> }),
});

const markdownViewer = createFileViewer({
    name: 'Markdown',
    viewerStateFactory: () => new ViewerStates.MarkdownViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.MarkdownEntryView {...{ entry, fileSystem }} /> }),
});

const mediaViewer = createFileViewer({
    name: 'Media',
    viewerStateFactory: () => new ViewerStates.MediaViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.MediaEntryView {...{ entry, fileSystem }} /> }),
});

const pdfViewer = createFileViewer({
    name: 'PDF',
    viewerStateFactory: () => new ViewerStates.PdfViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.PdfEntryView {...{ entry, fileSystem }} /> }),
});

const textViewer = createFileViewer({
    name: 'Text',
    viewerStateFactory: () => new ViewerStates.TextViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.TextEntryView {...{ entry, fileSystem }} /> }),
});

const tsvViewer = createFileViewer({
    name: 'TSV',
    viewerStateFactory: () => new ViewerStates.TsvViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.TsvEntryView {...{ entry, fileSystem }} /> }),
});

const createRedirectViewer = (params: {
    historyItem: HistoryItem;
    viewer: Viewer;
}): Viewer => {
    return {
        id: `redirected-${params.viewer.id}`,
        name: params.viewer.name,
        canRender: () => false,
        redirect: () => params.historyItem,
        render: () => null,
    };
};

export class ViewerServiceImpl implements ViewerService {
    #entryService: EntryService;

    constructor(params: {
        entryService: EntryService;
    }) {
        this.#entryService = params.entryService;
    }

    async #prioritizeViewers(params: {
        depth: number;
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal | null;
    }): Promise<Viewer[]> {
        const { depth, entry, fileSystem, signal } = params;

        if (entry.isSymbolicLink()) {
            const link = await this.#entryService.readLink({ entry, fileSystem }, { signal });

            const viewers: Viewer[] = link.entry == null || link.entry.isSymbolicLink() && depth >= 9 ? [] :
                await this.#prioritizeViewers({ depth: depth + 1, entry: link.entry, fileSystem, signal });

            if (!viewers.some(({ id }) => id === 'symblic-link'))
                viewers.push(symbolicLinkViewer);

            return viewers;
        }

        if (entry.isDirectory()) {
            if (fileSystem.isZip()) {
                if (entry.equals(rootDirectory)) {
                    const viewers = await this.#prioritizeViewers({ ...fileSystem.container, depth, signal });
                    const historyItem = new HistoryItem({ ...fileSystem.container });
                    return viewers.map((viewer) => {
                        if (viewer.id === 'redirected-zip')
                            return zipViewer;
                        if (viewer.id === 'redirected-comic')
                            return comicViewer;
                        return createRedirectViewer({ historyItem: viewer.redirect(historyItem), viewer });
                    });
                }

                return [zipViewer, comicViewer];
            }

            const viewers = [] as Viewer[];

            viewers.push(directoryViewer);
            viewers.push(comicViewer);

            return viewers;
        }

        if (entry.isFile()) {
            const viewers = [] as Viewer[];

            viewers.push(binaryViewer);
            viewers.push(cssViewer);
            viewers.push(imageViewer);
            viewers.push(javascriptViewer);
            viewers.push(markdownViewer);
            viewers.push(mediaViewer);
            viewers.push(pdfViewer);
            viewers.push(textViewer);
            viewers.push(tsvViewer);

            const zipFileSystem = new ZipFileSystem({ container: { entry, fileSystem } });
            viewers.push(createRedirectViewer({
                historyItem: new HistoryItem({
                    entry: rootDirectory,
                    fileSystem: zipFileSystem,
                    viewerState: new ViewerStates.ComicViewerState(),
                }),
                viewer: comicViewer,
            }));
            viewers.push(createRedirectViewer({
                historyItem: new HistoryItem({
                    entry: rootDirectory,
                    fileSystem: zipFileSystem,
                    viewerState: new ViewerStates.DirectoryViewerState(),
                }),
                viewer: zipViewer,
            }));

            viewers.sort(
                this.#hasComicExtension(entry) ? (viewer) => viewer.id === 'redirected-comic' ? -1 : 0 :
                this.#hasCssExtension(entry) ? (viewer) => viewer.id === 'css' ? -1 : 0 :
                this.#hasImageExtension(entry) ? (viewer) => viewer.id === 'image' ? -1 : 0 :
                this.#hasJavaScriptExtension(entry) ? (viewer) => viewer.id === 'javascript' ? -1 : 0 :
                this.#hasMarkdownExtension(entry) ? (viewer) => viewer.id === 'markdown' ? -1 : 0 :
                this.#hasMediaExtension(entry) ? (viewer) => viewer.id === 'media' ? -1 : 0 :
                this.#hasPdfExtension(entry) ? (viewer) => viewer.id === 'pdf' ? -1 : 0 :
                this.#hasTextExtension(entry) ? (viewer) => viewer.id === 'text' ? -1 : 0 :
                this.#hasTsvExtension(entry) ? (viewer) => viewer.id === 'tsv' ? -1 : 0 :
                this.#hasZipExtension(entry) ? (viewer) => viewer.id === 'redirected-zip' ? -1 : 0 :
                () => 0,
            );

            return viewers;
        }

        return [];
    }

    #hasComicExtension(entry: FileEntry) {
        return /^\.(?:cbz)$/.test(entry.path.getExtension());
    }

    #hasCssExtension(entry: FileEntry) {
        return /^\.(?:css)$/i.test(entry.path.getExtension());
    }

    #hasImageExtension(entry: FileEntry) {
        return /^\.(?:jpe?g|png|svg|webp)$/i.test(entry.path.getExtension());
    }

    #hasJavaScriptExtension(entry: FileEntry) {
        return /^\.(?:jsx?)$/i.test(entry.path.getExtension());
    }

    #hasMarkdownExtension(entry: FileEntry) {
        return /^\.(?:md|markdown)$/i.test(entry.path.getExtension());
    }

    #hasMediaExtension(entry: FileEntry) {
        return /\.(?:m4a|mp[34]|wav)/.test(entry.path.getExtension());
    }

    #hasPdfExtension(entry: FileEntry) {
        return /^\.pdf$/i.test(entry.path.getExtension());
    }

    #hasTextExtension(entry: FileEntry) {
        return /^\.(?:txt)$/.test(entry.path.getExtension());
    }

    #hasTsvExtension(entry: FileEntry) {
        return /^\.(?:tsv)$/.test(entry.path.getExtension());
    }

    #hasZipExtension(entry: FileEntry) {
        return /^\.(?:zip)$/.test(entry.path.getExtension());
    }

    async prioritizeViewers(
        params: PrioritizeViewersParameters,
        options?: PrioritizeViewersOptions,
    ): Promise<Viewer[]> {
        return this.#prioritizeViewers({
            depth: 1,
            entry: params.entry,
            fileSystem: params.fileSystem,
            signal: options?.signal ?? null,
        });
    }

    selectViewer(
        params: SelectViewerParameters,
    ): Viewer | null {
        const { historyItem, viewers } = params;
        const viewer = viewers.find((viewer) => viewer.canRender(historyItem)) ?? viewers[0];
        return viewer ?? null;
    }
}