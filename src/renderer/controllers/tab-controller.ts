import type { Entry, FileSystem } from '../../common/entities';
import { CloseController } from '../../common/utils/close-controller';
import { Restate, State } from '../../common/utils/restate';
import type { HistoryControllerFactory } from '../factories/history-controller-factory';
import type { HistoryController, HistoryItem } from './history-controller';

export type TabState = {
    active: boolean;
    historyController: HistoryController;
    id: number;
    title: string;
};

export type TabControllerState = {
    tabs: TabState[];
};

export type TabController = {
    readonly state: State<TabControllerState>;

    addTab(params: AddTabParameters): void;

    removeTab(params: RemoveTabParameters): void;

    selectNextTab(): void;

    selectTab(params: SelectTabParameters): void;

    selectPreviousTab(): void;
};

export type AddTabParameters = {
    active: boolean;
    historyItem?: {
        entry: Entry;
        fileSystem: FileSystem;
    } | null;
};

export type RemoveTabParameters = {
    id: number;
};

export type SelectTabParameters = {
    id: number;
};

export type TabAllClosedEvent = {
    type: 'tab-all-closed';
};

type InternalState = {
    idCounter: number;
    tabs: {
        active: boolean;
        closeController: CloseController;
        historyController: HistoryController;
        id: number;
        title: string;
    }[];
};

export class TabControllerImpl implements TabController {
    #defaultHistoryItem: HistoryItem;

    #historyControllerFactory: HistoryControllerFactory;

    #restate: Restate<InternalState>;

    #state: State<TabControllerState>;

    constructor(params: {
        defaultHistoryItem: HistoryItem;
        historyControllerFactory: HistoryControllerFactory;
    }) {
        this.#defaultHistoryItem = params.defaultHistoryItem;

        this.#historyControllerFactory = params.historyControllerFactory;

        this.#restate = new Restate<InternalState>({ idCounter: 1, tabs: [] });

        this.#state = this.#restate.state.map((state) => ({
            tabs: state.tabs.map((tab) => ({
                active: tab.active,
                historyController: tab.historyController,
                id: tab.id,
                title: tab.title,
            })),
        }));
    }

    get state(): State<TabControllerState> {
        return this.#state;
    }

    addTab(params: AddTabParameters): void {
        this.#restate.update(async (state) => {
            const id = state.idCounter;
            const idCounter = state.idCounter + 1;
            const active = params.active || state.tabs.length === 0;
            const closeController = new CloseController();
            const initialHistoryItem = params.historyItem ?? this.#defaultHistoryItem;
            const historyController = this.#historyControllerFactory.create({ initialHistoryItem });
            const titleState = historyController.state.map(({ current }) => current.entry.name.toString());
            titleState.forEach((title) => {
                this.#restate.update((state) => ({
                    ...state,
                    tabs: state.tabs.map((tab) => tab.id !== id ? tab : ({ ...tab, title })),
                }));
            }, { signal: closeController.signal });
            const tabs = !active ? [...state.tabs] : state.tabs.map((tab) => ({ ...tab, active: false }));
            tabs.push({ active, closeController, historyController, id, title: titleState.current });
            return { ...state, idCounter, tabs };
        });
    }

    removeTab(params: RemoveTabParameters): void {
        this.#restate.update((state) => {
            const id = params.id;
            const tabIndex = state.tabs.findIndex((tab) => tab.id === id);
            if (tabIndex === -1)
                return state;
            const tab = state.tabs[tabIndex];
            tab.closeController.close();
            const activeIndex = Math.min(state.tabs.length - 2, state.tabs.findIndex((tab) => tab.active));
            const tabs = state.tabs
                .filter((tab) => tab.id !== id)
                .map((tab, index) => ({ ...tab, active: index === activeIndex }));
            return { ...state, tabs };
        });
    }

    selectNextTab(): void {
        this.#restate.update((state) => {
            const activeIndex = state.tabs.findIndex((tab) => tab.active);
            if (activeIndex === -1 || state.tabs.length <= 1)
                return state;
            const index = ((activeIndex + 1) % state.tabs.length + state.tabs.length) % state.tabs.length;
            const tabs = state.tabs.map((tab, i) => ({ ...tab, active: i === index }));
            return { ...state, tabs };
        });
    }

    selectPreviousTab(): void {
        this.#restate.update((state) => {
            const activeIndex = state.tabs.findIndex((tab) => tab.active);
            if (activeIndex === -1 || state.tabs.length <= 1)
                return state;
            const index = ((activeIndex - 1) % state.tabs.length + state.tabs.length) % state.tabs.length;
            const tabs = state.tabs.map((tab, i) => ({ ...tab, active: i === index }));
            return { ...state, tabs };
        });
    }

    selectTab(params: SelectTabParameters): void {
        this.#restate.update((state) => {
            const index = state.tabs.findIndex((tab) => tab.id === params.id);
            if (index === -1)
                return state;
            const tabs = state.tabs.map((tab, i) => ({ ...tab, active: i === index }));
            return { ...state, tabs };
        });
    }
}
