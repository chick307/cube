import { DirectoryEntry, Entry, FileEntry } from '../../common/entities/entry';
import { FileSystem, ZipFileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseSignal } from '../../common/utils/close-controller';
import { EntryPath } from '../../common/values/entry-path';
import * as ViewerStates from '../../common/values/viewer-state';
import * as EntryViews from '../components/entry-views';
import * as Viewers from '../components/viewers';
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
    render(historyItem: HistoryItem) {
        const { entry, fileSystem } = historyItem;
        if (!entry.isSymbolicLink())
            return null;
        const viewerState = historyItem.viewerState as ViewerStates.SymbolicLinkViewerState;
        return <Viewers.SymbolicLinkViewer {...{ entry, fileSystem, viewerState }} />;
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
    render(historyItem: HistoryItem) {
        if (!historyItem.entry.isDirectory() && !historyItem.entry.isSymbolicLink())
            return null;
        const { entry, fileSystem } = historyItem;
        const viewerState = historyItem.viewerState as ViewerStates.DirectoryViewerState;
        return <Viewers.DirectoryViewer {...{ entry, fileSystem, viewerState }} />;
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
        const { entry, fileSystem } = historyItem;
        const viewerState = historyItem.viewerState as ViewerStates.ComicViewerState;
        return <Viewers.ComicViewer {...{ entry, fileSystem, viewerState }} />;
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
    render(historyItem: HistoryItem) {
        if (!historyItem.entry.isDirectory() && !historyItem.entry.isSymbolicLink())
            return null;
        const { entry, fileSystem } = historyItem;
        const viewerState = historyItem.viewerState as ViewerStates.DirectoryViewerState;
        return <Viewers.DirectoryViewer {...{ entry, fileSystem, viewerState }} />;
    },
};

const createFileViewer = <ViewerState extends ViewerStates.ViewerState>(params: {
    id?: string | null;
    name: string;
    viewerStateType?: string | null;
    viewerStateFactory: () => ViewerState;
    render: (historyItem: HistoryItem & { entry: FileEntry; viewerState: ViewerState; }) => { node: React.ReactNode; };
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
                return params.render(historyItem as HistoryItem & { entry: FileEntry; viewerState: ViewerState; }).node;
            return null;
        },
    };
};

const binaryViewer = createFileViewer({
    name: 'Binary',
    viewerStateFactory: () => new ViewerStates.BinaryViewerState(),
    render: ({ entry, fileSystem }) => ({ node: <EntryViews.BinaryEntryView {...{ entry, fileSystem }} /> }),
});

const imageViewer = createFileViewer({
    name: 'Image',
    viewerStateFactory: () => new ViewerStates.ImageViewerState(),
    render: ({ entry, fileSystem, viewerState }) => ({
        node: <Viewers.ImageViewer {...{ entry, fileSystem, viewerState }} />,
    }),
});

const markdownViewer = createFileViewer({
    name: 'Markdown',
    viewerStateFactory: () => new ViewerStates.MarkdownViewerState(),
    render: ({ entry, fileSystem, viewerState }) => ({
        node: <Viewers.MarkdownViewer {...{ entry, fileSystem, viewerState }} />,
    }),
});

const mediaViewer = createFileViewer({
    name: 'Media',
    viewerStateFactory: () => new ViewerStates.MediaViewerState(),
    render: ({ entry, fileSystem, viewerState }) => ({
        node: <Viewers.MediaViewer {...{ entry, fileSystem, viewerState }} />,
    }),
});

const pdfViewer = createFileViewer({
    name: 'PDF',
    viewerStateFactory: () => new ViewerStates.PdfViewerState(),
    render: ({ entry, fileSystem, viewerState }) => ({
        node: <Viewers.PdfViewer {...{ entry, fileSystem, viewerState }} />,
    }),
});

const textViewer = createFileViewer({
    name: 'Text',
    viewerStateFactory: () => new ViewerStates.TextViewerState(),
    render: ({ entry, fileSystem, viewerState }) => ({
        node: <Viewers.TextViewer {...{ entry, fileSystem, viewerState }} />,
    }),
});

const tsvViewer = createFileViewer({
    name: 'TSV',
    viewerStateFactory: () => new ViewerStates.TsvViewerState(),
    render: ({ entry, fileSystem, viewerState }) => ({
        node: <Viewers.TsvViewer {...{ entry, fileSystem, viewerState }} />,
    }),
});

const createTextFileViewer = (params: {
    language: string;
}) => {
    return createFileViewer({
        name: 'Text',
        viewerStateFactory: () => new ViewerStates.TextViewerState({ language: params.language }),
        render: ({ entry, fileSystem, viewerState }) => ({
            node: <Viewers.TextViewer {...{ entry, fileSystem, viewerState }} />,
        }),
    });
};

const cssTextViewer = createTextFileViewer({ language: 'css' });
const javascriptTextViewer = createTextFileViewer({ language: 'javascript' });

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
            const link = await this.#entryService.readLink({ entry, fileSystem, signal });

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
            viewers.push(imageViewer);
            viewers.push(markdownViewer);
            viewers.push(mediaViewer);
            viewers.push(pdfViewer);
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

            if (this.#hasCssExtension(entry)) {
                viewers.unshift(cssTextViewer);
            } else if (this.#hasJavaScriptExtension(entry)) {
                viewers.unshift(javascriptTextViewer);
            } else {
                viewers.push(textViewer);
                viewers.sort(
                    this.#hasComicExtension(entry) ? (viewer) => viewer.id === 'redirected-comic' ? -1 : 0 :
                    this.#hasImageExtension(entry) ? (viewer) => viewer.id === 'image' ? -1 : 0 :
                    this.#hasMarkdownExtension(entry) ? (viewer) => viewer.id === 'markdown' ? -1 : 0 :
                    this.#hasMediaExtension(entry) ? (viewer) => viewer.id === 'media' ? -1 : 0 :
                    this.#hasPdfExtension(entry) ? (viewer) => viewer.id === 'pdf' ? -1 : 0 :
                    this.#hasTextExtension(entry) ? (viewer) => viewer.id === 'text' ? -1 : 0 :
                    this.#hasTsvExtension(entry) ? (viewer) => viewer.id === 'tsv' ? -1 : 0 :
                    this.#hasZipExtension(entry) ? (viewer) => viewer.id === 'redirected-zip' ? -1 : 0 :
                    () => 0,
                );
            }

            return viewers;
        }

        return [];
    }

    #hasComicExtension(entry: FileEntry) {
        return /^\.(?:cbz)$/i.test(entry.path.getExtension());
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
        return /\.(?:m4a|mp[34]|wav)/i.test(entry.path.getExtension());
    }

    #hasPdfExtension(entry: FileEntry) {
        return /^\.pdf$/i.test(entry.path.getExtension());
    }

    #hasTextExtension(entry: FileEntry) {
        return /^\.(?:txt)$/i.test(entry.path.getExtension());
    }

    #hasTsvExtension(entry: FileEntry) {
        return /^\.(?:tsv)$/i.test(entry.path.getExtension());
    }

    #hasZipExtension(entry: FileEntry) {
        return /^\.(?:zip)$/i.test(entry.path.getExtension());
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
