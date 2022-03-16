import type { Entry, FileEntry } from '../../common/entities/entry';
import type { FileSystem } from '../../common/entities/file-system';
import { CloseController, CloseSignal } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import { TsvViewerState } from '../../common/values/viewer-state';
import type { EntryService } from '../services/entry-service';

export type TsvViewerController = {
    readonly state: State<TsvViewerControllerState>;

    initialize(params: InitializeParams): void;
};

export type TsvViewerControllerState = {
    readonly header: TsvViewerRow;

    readonly rows: TsvViewerRow[];
};

export type TsvViewerRow = {
    cells: TsvViewerCell[];
    id: string;
};

export type TsvViewerCell = {
    id: string;
    value: string;
};

export type InitializeParams = {
    readonly entry: Entry;

    readonly fileSystem: FileSystem;

    readonly viewerState: TsvViewerState;
};

type InternalState = {
    readonly header: TsvViewerRow;

    readonly rows: TsvViewerRow[];

    readonly viewerState: TsvViewerState;
};

const defaultState: InternalState = {
    header: { cells: [], id: 'header' },
    rows: [],
    viewerState: new TsvViewerState(),
};

export class TsvViewerControllerImpl implements TsvViewerController {
    #closeController: CloseController | null;

    #entry: Entry | null;

    #entryService: EntryService;

    #fileSystem: FileSystem | null;

    #viewerState: TsvViewerState;

    #restate: Restate<InternalState>;

    #state: State<TsvViewerControllerState>;

    constructor(params: {
        readonly entryService: EntryService;
    }) {
        this.#entryService = params.entryService;

        this.#closeController = null;
        this.#entry = null;
        this.#fileSystem = null;
        this.#viewerState = defaultState.viewerState;

        this.#restate = new Restate({ ...defaultState });

        this.#state = this.#restate.state.map<TsvViewerControllerState>((state) => {
            const { header, rows } = state;

            return {
                header,
                rows,
            };
        });
    }

    get state(): State<TsvViewerControllerState> {
        return this.#state;
    }

    async #initialize(params: {
        entry: Entry;
        fileSystem: FileSystem;
        signal: CloseSignal;
    }): Promise<void> {
        const { fileSystem, signal } = params;
        const entry = params.entry as FileEntry;

        const buffer = await this.#entryService.readFile({ entry, fileSystem, signal });
        const text = buffer.toString('utf8');

        const lines = text.split('\n');
        const rows: TsvViewerRow[] = [];
        let index = 0;
        for (const line of lines) {
            if (line === '' && index === lines.length - 1)
                continue;
            index++;
            const values = line.split('\t');
            rows.push({
                cells: values.map<TsvViewerCell>((value, i) => {
                    return {
                        id: `cell-${index}-${i}`,
                        value,
                    };
                }),
                id: `row-${index}`,
            });
        }

        const header = rows.shift() ?? defaultState.header;

        this.#update((state) => ({ ...state, header, rows }));
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
        this.#update(() => ({ ...defaultState, viewerState }));

        this.#initialize({ entry, fileSystem, signal });
    }
}
