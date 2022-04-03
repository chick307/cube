import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { BinaryViewerState } from '../../common/values/viewer-state';
import type { HistoryController } from '../controllers/history-controller';
import type { EntryService } from '../services/entry-service';

export type BinaryViewerController = {
    readonly state: State<BinaryViewerControllerState>;

    initialize(params: InitializeParams): void;

    scrollTo(params: ScrollToParams): void;
};

export type BinaryViewerControllerState = {
    readonly blocks: BinaryViewerControllerBlockState[] | null;

    readonly buffer: Buffer | null;

    readonly scrollPosition: Point;
};

export type BinaryViewerControllerBlockState = {
    readonly blockEnd: number;

    readonly blockStart: number;

    readonly codePoints: (number | null)[];

    readonly id: string;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: BinaryViewerState;
};

export type ScrollToParams = {
    readonly position: Point;
};

type InternalState = {
    readonly blocks: BinaryViewerControllerBlockState[] | null;

    readonly buffer: Buffer | null;

    readonly viewerState: BinaryViewerState;
};

const MAX_BLOCK_SIZE = 1024;

const defaultViewerState = new BinaryViewerState();

const initialState: InternalState = {
    blocks: null,
    buffer: null,
    viewerState: defaultViewerState,
};

export class BinaryViewerControllerImpl implements BinaryViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #historyController: HistoryController;

    #restate: Restate<InternalState>;

    #state: State<BinaryViewerControllerState>;

    #viewerState: BinaryViewerState | null;

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
            const { blocks, buffer, viewerState } = state;
            const { scrollPosition } = viewerState;
            return {
                blocks,
                buffer,
                scrollPosition,
            };
        });
    }

    get state(): State<BinaryViewerControllerState> {
        return this.#state;
    }

    #decodeText(params: {
        buffer: Buffer;
        end: number;
        start: number;
    }): (number | null)[] {
        const { buffer, end, start } = params;
        const bufferEnd = buffer.length;
        const codePoints: (number | null)[] = [];
        let offset = start;
        const getSextet = () => {
            if (offset + 1 < bufferEnd && buffer[offset + 1] >> 6 === 0b10)
                return buffer[++offset] & 0b111111;
            return null;
        };
        for (; offset < end; offset++) {
            const octet = buffer[offset];
            if (octet >> 7 === 0) {
                codePoints.push(octet);
            } else if (octet >> 6 === 0b10) {
                codePoints.push(null);
            } else if (octet >> 5 === 0b110) {
                const sextets = [getSextet()];
                if (sextets.every((sextet): sextet is number => sextet !== null))
                    codePoints.push(sextets.reduce((c, sextet) => c * 2 ** 6 + sextet, octet & 0b11111));
                codePoints.push(null);
            } else if (octet >> 4 === 0b1110) {
                const sextets = [getSextet(), getSextet()];
                if (sextets.every((sextet): sextet is number => sextet !== null)) {
                    codePoints.push(sextets.reduce((c, sextet) => c * 2 ** 6 + sextet, octet & 0b1111));
                    codePoints.push(null, null);
                } else {
                    codePoints.push(null);
                    for (const sextet of sextets) {
                        if (sextet === null)
                            break;
                        codePoints.push(null);
                    }
                }
            } else if (octet >> 3 === 0b11110) {
                const sextets = [getSextet(), getSextet(), getSextet()];
                if (sextets.every((sextet): sextet is number => sextet !== null)) {
                    codePoints.push(sextets.reduce((c, sextet) => c * 2 ** 6 + sextet, octet & 0b111));
                    codePoints.push(null, null, null);
                } else {
                    codePoints.push(null);
                    for (const sextet of sextets) {
                        if (sextet === null)
                            break;
                        codePoints.push(null);
                    }
                }
            }
        }
        return codePoints;
    }

    async #initialize(params: {
        readonly entry: Entry;
        readonly fileSystem: FileSystem;
        readonly signal: CloseSignal;
        readonly viewerState: BinaryViewerState;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as FileEntry;
        const buffer = await this.#entryService.readFile({ entry, fileSystem, signal });
        const blocks: BinaryViewerControllerBlockState[] = [];
        const blockLength = Math.ceil(buffer.length / MAX_BLOCK_SIZE);
        for (let i = 0; i < blockLength; i++) {
            const blockStart = i * MAX_BLOCK_SIZE;
            const blockEnd = Math.min(blockStart + MAX_BLOCK_SIZE, buffer.length);
            const codePoints = this.#decodeText({ buffer, end: blockEnd, start: blockStart });
            const id = `block-${blockStart.toString(36)}`;
            blocks.push({ blockEnd, blockStart, codePoints, id });
        }
        this.#update((state) => ({ ...state, blocks, buffer }));
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

    scrollTo(params: ScrollToParams): void {
        const entry = this.#entry;
        if (entry == null)
            return;

        const { position } = params;
        const textViewerState = this.#viewerState as BinaryViewerState;
        if (textViewerState.scrollPosition.equals(position))
            return;
        const fileSystem = this.#fileSystem as FileSystem;
        const viewerState = textViewerState.setScrollPosition(position);
        this.#viewerState = viewerState;
        this.#update((state) => ({ ...state, viewerState }));
        const historyItem = new HistoryItem({ entry, fileSystem, viewerState });
        this.#historyController.replace(historyItem);
    }
}
