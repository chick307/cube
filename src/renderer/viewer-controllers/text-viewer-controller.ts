import type { ElementContent, Root, RootContent } from 'hast';
import { h } from 'hastscript';
import { lowlight } from 'lowlight';

import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { TextViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';

export type TextViewerController = {
    readonly state: State<TextViewerControllerState>;

    initialize(params: InitializeParams): void;

    setLanguage(value: string): void;

    scrollTo(params: ScrollToParams): void;
};

export type TextViewerControllerState = {
    readonly language: string;

    readonly lines: TextViewerControllerLineState[] | null;

    readonly scrollPosition: Point;
};

export type TextViewerControllerLineState = {
    readonly lineNumber: number;

    readonly tree: Root;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: TextViewerState;
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
    readonly lines: TextViewerControllerLineState[] | null;

    readonly text: string | null;

    readonly viewerState: TextViewerState;
};

const defaultViewerState = new TextViewerState();

const initialState: InternalState = {
    text: null,
    lines: null,
    viewerState: defaultViewerState,
};

export class TextViewerControllerImpl implements TextViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #restate: Restate<InternalState>;

    #state: State<TextViewerControllerState>;

    #viewerState: TextViewerState | null;

    constructor(params: {
        readonly entryService: EntryService;

        readonly historyController: HistoryController;
    }) {
        this.#entryService = params.entryService;
        this.#historyController = params.historyController;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = null;

        this.#restate = new Restate<InternalState>(initialState);

        this.#state = this.#restate.state.map((state) => {
            const { lines, viewerState } = state;
            const { language, scrollPosition } = viewerState;
            return {
                language,
                lines,
                scrollPosition,
            };
        });
    }

    get state(): State<TextViewerControllerState> {
        return this.#state;
    }

    async #initialize(params: {
        readonly entry: Entry;
        readonly fileSystem: FileSystem;
        readonly signal: CloseSignal;
        readonly viewerState: TextViewerState;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as FileEntry;
        const buffer = await this.#entryService.readFile({ entry, fileSystem, signal });
        const text = buffer.toString('utf8');
        this.#updateWithHighlight((state) => ({ ...state, text }));
    }

    #splitLines(params: {
        readonly node: ElementContent | Root | RootContent;
    }): ElementContent[] {
        const { node } = params;
        switch (node.type) {
            case 'element':
            case 'root': {
                const tagName = node.type === 'element' ? node.tagName : 'span';
                const properties = node.type === 'element' ? node.properties : {};
                const lines: ElementContent[] = [];
                let lastLine: ElementContent[] = [];
                for (const childLine of node.children.map((child) => this.#splitLines({ node: child }))) {
                    while (childLine.length > 1) {
                        lines.push(h(tagName, properties, ...lastLine, childLine.shift()));
                        lastLine = [];
                    }
                    if (childLine.length === 1)
                        lastLine.push(childLine[0]);
                }
                if (
                    node.type === 'root' &&
                    lastLine.length === 1 &&
                    lastLine[0].type === 'text' &&
                    lastLine[0].value === ''
                ) {
                    lastLine = [];
                }
                if (lastLine.length > 0)
                    lines.push(h(tagName, properties, ...lastLine));
                return lines;
            }
            case 'text': {
                const values = node.value.split('\n');
                return values.map((v, index) => {
                    const type = 'text';
                    const value = index + 1 < values.length ? `${v}\n` : v;
                    return { type, value };
                });
            }
            default: {
                return [];
            }
        }
    }

    #update(callback: (state: InternalState) => InternalState): void {
        this.#restate.update((previousState) => {
            const state = callback(previousState);
            return {
                ...state,
            };
        });
    }

    #updateWithHighlight(callback: (state: InternalState) => InternalState): void {
        this.#update((previousState) => {
            const state = callback(previousState);
            const { viewerState, text } = state;
            if (text === null)
                return { ...state, lines: null };

            const { language } = viewerState;
            const rootTree = lowlight.highlight(language, text);
            const lineContents = this.#splitLines({ node: rootTree });
            const lines = lineContents.map((content, index) => {
                const lineNumber = index + 1;
                const tree = h(null, content);
                return { lineNumber, tree };
            });
            return { ...state, lines };
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

    setLanguage(value: string): void {
        const entry = this.#entry;
        if (entry === null)
            return;

        const fileSystem = this.#fileSystem as FileSystem;
        const textViewerState = this.#viewerState as TextViewerState;
        const viewerState = textViewerState.setLanguage(value);
        if (textViewerState.equals(viewerState))
            return;
        this.#viewerState = viewerState;
        this.#updateWithHighlight((state) => ({ ...state, viewerState }));

        const newHistoryItem = new HistoryItem({ entry, fileSystem, viewerState });
        this.#historyController.replace(newHistoryItem);
    }

    scrollTo(params: ScrollToParams): void {
        const entry = this.#entry;
        if (entry == null)
            return;

        const { position } = params;
        const textViewerState = this.#viewerState as TextViewerState;
        if (textViewerState.scrollPosition.equals(position))
            return;
        const fileSystem = this.#fileSystem as FileSystem;
        const viewerState = textViewerState.setScrollPosition(position);
        this.#viewerState = viewerState;
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        this.#historyController.replace(historyItem);
    }
}
