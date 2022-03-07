import { shell } from 'electron';
import type { Root } from 'hast';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { EntryPath } from '../../common/values/entry-path';
import { Point } from '../../common/values/point';
import { MarkdownViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import { TabController } from '../controllers/tab-controller';
import type { EntryService } from '../services/entry-service';

export type MarkdownViewerController = {
    readonly state: State<MarkdownViewerControllerState>;

    initialize(params: InitializeParams): void;

    loadImage(params: LoadImageParams): Promise<Blob | null>;

    openLink(params: OpenLinkParams): void;

    scrollTo(params: ScrollToParams): void;
};

export type MarkdownViewerControllerState = {
    readonly scrollPosition: Point;

    readonly tree: Root | null;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: MarkdownViewerState;
};

export type LoadImageParams = {
    readonly src: string;
};

export type OpenLinkParams = {
    readonly inNewTab: boolean;

    readonly href: string;
};

export type ScrollToParams = {
    readonly position: Point;
};

type InternalState = {
    readonly viewerState: MarkdownViewerState;

    readonly tree: Root | null;
};

const defaultViewerState = new MarkdownViewerState();

const initialState: InternalState = {
    viewerState: defaultViewerState,
    tree: null,
};

const highlightClassNames = [
    'hljs', 'hljs-addition', 'hljs-attr', 'hljs-attribute', 'hljs-built_in', 'hljs-bullet', 'hljs-char', 'hljs-code',
    'hljs-comment', 'hljs-deletion', 'hljs-doctag', 'hljs-emphasis', 'hljs-formula', 'hljs-keyword', 'hljs-link',
    'hljs-literal', 'hljs-meta', 'hljs-name', 'hljs-number', 'hljs-operator', 'hljs-params', 'hljs-property',
    'hljs-punctuation', 'hljs-quote', 'hljs-regexp', 'hljs-section', 'hljs-selector-attr', 'hljs-selector-class',
    'hljs-selector-id', 'hljs-selector-pseudo', 'hljs-selector-tag', 'hljs-string', 'hljs-strong', 'hljs-subst',
    'hljs-symbol', 'hljs-tag', 'hljs-template-tag', 'hljs-template-variable', 'hljs-title', 'hljs-type',
    'hljs-variable',
];

const mathClassNames = ['math', 'math-display'];

const mathInlineClassNames = ['math', 'math-inline'];

export class MarkdownViewerControllerImpl implements MarkdownViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #restate: Restate<InternalState>;

    #state: State<MarkdownViewerControllerState>;

    #tabController: TabController;

    #viewerState: MarkdownViewerState | null;

    constructor(params: {
        readonly entryService: EntryService;

        readonly historyController: HistoryController;

        readonly tabController: TabController;
    }) {
        this.#entryService = params.entryService;
        this.#historyController = params.historyController;
        this.#tabController = params.tabController;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = null;

        this.#restate = new Restate<InternalState>(initialState);

        this.#state = this.#restate.state.map((state) => {
            const { tree, viewerState } = state;
            const { scrollPosition } = viewerState;
            return {
                scrollPosition,
                tree,
            };
        });
    }

    get state(): State<MarkdownViewerControllerState> {
        return this.#state;
    }

    #getMediaType(entryPath: EntryPath): string | undefined {
        const extension = entryPath.getExtension().toLowerCase();
        switch (extension) {
            case '.jpg': case '.jpeg': return 'image/jpeg';
            case '.png': return 'image/png';
            case '.gif': return 'image/gif';
            case '.webp': return 'image/webp';
            case '.svg': return 'image/svg+xml';
            default: return undefined;
        }
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
        viewerState: MarkdownViewerState;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as FileEntry;
        const buffer = await this.#entryService.readFile({ entry, fileSystem, signal });
        const markdown = buffer.toString('utf8');
        const processor = unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(rehypeHighlight)
            .use(rehypeSanitize, {
                ...defaultSchema,
                attributes: {
                    ...defaultSchema.attributes,
                    div: [
                        ...(defaultSchema.attributes?.div ?? []),
                        ['className', ...mathClassNames, ...mathClassNames],
                    ],
                    span: [
                        ...(defaultSchema.attributes?.span ?? []),
                        ['className', ...highlightClassNames, ...mathInlineClassNames],
                    ],
                },
            })
            .use(rehypeKatex); // rehypeKatex is needed to be after rehypeSanitize
        const tree = await signal.wrapPromise(processor.run(processor.parse(markdown)));
        this.#update((state) => ({ ...state, tree }));
    }

    #update(callback: (state: InternalState) => InternalState): void {
        this.#restate.update((previousState) => {
            const state = callback(previousState);

            return {
                ...state,
            };
        });
    }

    initialize(params: InitializeParams): void {
        const { entry, fileSystem, viewerState } = params;
        if (
            (this.#entry?.equals(entry) ?? this.#entry === entry) &&
            (this.#fileSystem?.equals(fileSystem) ?? this.#fileSystem === fileSystem)
        ) {
            if (this.#viewerState !== viewerState) {
                this.#viewerState = viewerState;
                this.#update((state) => ({ ...state, viewerState }));
            }
            return;
        }

        this.#closeController?.close();
        const closeController = new CloseController();
        this.#closeController = closeController;
        const { signal } = closeController;
        this.#entry = entry;
        this.#fileSystem = fileSystem;
        this.#viewerState = viewerState;
        this.#update(() => ({ ...initialState, viewerState }));

        this.#initialize({ entry, fileSystem, viewerState, signal });
    }

    async loadImage(params: LoadImageParams): Promise<Blob | null> {
        const entryPath = this.#entry?.path;
        const signal = this.#closeController?.signal;
        if (entryPath == null)
            return null;

        const { src } = params;
        const url = new URL(src, `file://${entryPath.toString()}`);
        if (url.protocol === 'file:') {
            const entryPath = new EntryPath(decodeURI(url.pathname));
            const fileSystem = this.#fileSystem as FileSystem;
            const entry = await this.#entryService.createEntryFromPath({ entryPath, fileSystem, signal });
            if (entry === null)
                return null;
            const buffer = await this.#entryService.readFile({ entry: entry as FileEntry, fileSystem, signal });
            const type = this.#getMediaType(entryPath) ?? undefined;
            const blob = new Blob([buffer], { type });
            return blob;
        }

        return null;
    }

    openLink(params: OpenLinkParams): void {
        const entryPath = this.#entry?.path;
        const signal = this.#closeController?.signal;
        if (entryPath == null)
            return;

        (async () => {
            const { inNewTab, href } = params;
            const fileSystem = this.#fileSystem as FileSystem;
            const url = new URL(href, `file://${entryPath.toString()}`);
            if (url.protocol === 'file:') {
                const entryPath = new EntryPath(decodeURI(url.pathname));
                const entry = await this.#entryService.createEntryFromPath({ entryPath, fileSystem, signal });
                if (entry == null)
                    return;
                const historyItem = new HistoryItem({ entry, fileSystem });
                if (inNewTab) {
                    this.#tabController.addTab({ active: true, historyItem });
                } else {
                    this.#historyController.navigate(historyItem);
                }
            } else {
                shell.openExternal(href);
            }
        })().catch(() => {
            //
        });
    }

    scrollTo(params: ScrollToParams): void {
        const entry = this.#entry;
        if (entry == null)
            return;

        const { position } = params;
        const markdownViewerState = this.#viewerState as MarkdownViewerState;
        if (markdownViewerState.scrollPosition.equals(position))
            return;
        const fileSystem = this.#fileSystem as FileSystem;
        const viewerState = markdownViewerState.setScrollPosition(position);
        this.#viewerState = viewerState;
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        this.#historyController.replace(historyItem);
    }
}
