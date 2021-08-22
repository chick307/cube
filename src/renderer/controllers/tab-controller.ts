import type { Entry, FileSystem } from '../../common/entities';
import { CloseController } from '../../common/utils/close-controller';
import { EventController, EventSignal } from '../../common/utils/event-controller';
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

    readonly onActiveTabChanged: EventSignal<ActiveTabChangedEvent>;

    readonly onHistoryStateChanged: EventSignal<HistoryStateChangedEvent>;

    readonly onTabAllClosed: EventSignal<TabAllClosedEvent>;

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

export type ActiveTabChangedEvent = {
    type: 'active-tab-changed';
    tabId: number;
};

export type HistoryStateChangedEvent = {
    type: 'history-state-changed';
    tabId: number;
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

    #onActiveTabChangedController = new EventController<ActiveTabChangedEvent>();

    #onHistoryStateChangedController = new EventController<HistoryStateChangedEvent>();

    #onTabAllClosedController = new EventController<TabAllClosedEvent>();

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

        let activeTab: InternalState['tabs'][number] | null = null;
        this.#restate.state.forEach((state) => {
            for (const tab of state.tabs) {
                if (tab.active && tab.id !== activeTab?.id) {
                    activeTab = tab;
                    this.#onActiveTabChangedController.emit({ type: 'active-tab-changed', tabId: tab.id });
                }
            }
        });
    }

    get state(): State<TabControllerState> {
        return this.#state;
    }

    get onActiveTabChanged(): EventSignal<ActiveTabChangedEvent> {
        return this.#onActiveTabChangedController.signal;
    }

    get onHistoryStateChanged(): EventSignal<HistoryStateChangedEvent> {
        return this.#onHistoryStateChangedController.signal;
    }

    get onTabAllClosed(): EventSignal<TabAllClosedEvent> {
        return this.#onTabAllClosedController.signal;
    }

    addTab(params: AddTabParameters): void {
        this.#restate.update(async (state) => {
            const id = state.idCounter;
            const idCounter = state.idCounter + 1;
            const active = params.active || state.tabs.length === 0;
            const closeController = new CloseController();
            const initialHistoryItem = params.historyItem ?? this.#defaultHistoryItem;
            const historyController = this.#historyControllerFactory.create({ initialHistoryItem });
            const historyState = {
                ableToGoBack: historyController.state.current.ableToGoBack,
                ableToGoForward: historyController.state.current.ableToGoForward,
                current: historyController.state.current.current,
            };
            historyController.state.forEach((state) => {
                if (
                    historyState.ableToGoBack !== state.ableToGoBack ||
                    historyState.ableToGoForward !== state.ableToGoForward ||
                    !historyState.current.fileSystem.equals(state.current.fileSystem) ||
                    !historyState.current.entry.equals(state.current.entry)
                ) {
                    historyState.ableToGoBack = state.ableToGoBack;
                    historyState.ableToGoForward = state.ableToGoForward;
                    historyState.current = state.current;
                    this.#onHistoryStateChangedController.emit({ type: 'history-state-changed', tabId: id });
                }
            }, { signal: closeController.signal });
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
            let activeIndex = Math.min(state.tabs.length - 2, state.tabs.findIndex((tab) => tab.active));
            if (tabIndex < activeIndex)
                activeIndex = Math.max(0, activeIndex - 1);
            const tabs = state.tabs
                .filter((tab) => tab.id !== id)
                .map((tab, index) => ({ ...tab, active: index === activeIndex }));
            if (tabs.length === 0)
                this.#onTabAllClosedController.emit({ type: 'tab-all-closed' });
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
