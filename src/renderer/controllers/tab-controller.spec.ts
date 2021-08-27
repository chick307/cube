import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { immediate } from '../../common/utils/immediate';
import { Restate, State } from '../../common/utils/restate';
import type { HistoryController } from './history-controller';
import { TabControllerImpl } from './tab-controller';

const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const entryB = Entry.fromJson({ type: 'directory', path: '/a/b' });
const entryC = Entry.fromJson({ type: 'directory', path: '/a/b/c' });
const entryD = Entry.fromJson({ type: 'directory', path: '/a/b/c/d' });
const fileSystem = new FileSystem();
const historyItemA = { entry: entryA, fileSystem };
const historyItemB = { entry: entryB, fileSystem };
const historyItemC = { entry: entryC, fileSystem };
const historyItemD = { entry: entryD, fileSystem };
const defaultHistoryItem = historyItemA;

const defaultHistoryController: HistoryController = {
    state: State.of({
        ableToGoBack: false,
        ableToGoForward: false,
        current: defaultHistoryItem,
    }),
    goBack: () => {},
    goForward: () => {},
    navigate: () => {},
    replace: () => {},
};

const historyControllerFactory = {
    create: jest.fn((params) => ({
        ...defaultHistoryController,
        state: defaultHistoryController.state.map((state) => ({
            ...state,
            current: params.initialHistoryItem ?? defaultHistoryItem,
        })),
    })),
};

const createTabController = () => new TabControllerImpl({ defaultHistoryItem, historyControllerFactory });

afterEach(() => {
    jest.clearAllMocks();
});

describe('TabController type', () => {
    describe('tabController.onActiveTabChanged property', () => {
        test('it is emitted when the active tab is changed', async () => {
            const tabController = createTabController();
            const spy = jest.fn();
            tabController.onActiveTabChanged.addListener(spy);
            tabController.addTab({ active: true });
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'active-tab-changed', tabId: 1 });
            spy.mockClear();
            tabController.addTab({ active: false });
            tabController.addTab({ active: false });
            tabController.addTab({ active: false });
            tabController.addTab({ active: false });
            tabController.selectNextTab();
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'active-tab-changed', tabId: 2 });
            spy.mockClear();
            tabController.selectTab({ id: 4 });
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'active-tab-changed', tabId: 4 });
            spy.mockClear();
            tabController.selectPreviousTab();
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'active-tab-changed', tabId: 3 });
            spy.mockClear();
            tabController.removeTab({ id: 3 });
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'active-tab-changed', tabId: 4 });
            spy.mockClear();
            tabController.removeTab({ id: 2 });
            await immediate();
            expect(spy).not.toHaveBeenCalled();
            tabController.removeTab({ id: 4 });
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'active-tab-changed', tabId: 5 });
            spy.mockClear();
        });
    });

    describe('tabController.onHistoryStateChanged property', () => {
        test('it is emitted when the history state is changed', async () => {
            const restate = new Restate({
                ableToGoBack: false,
                ableToGoForward: false,
                current: historyItemA,
            });
            historyControllerFactory.create.mockReturnValueOnce({
                state: restate.state,
                goBack: () => {},
                goForward: () => {},
                navigate: () => {},
                replace: () => {},
            });
            const tabController = createTabController();
            const spy = jest.fn();
            tabController.onHistoryStateChanged.addListener(spy);
            tabController.addTab({ active: false });
            await immediate();
            expect(spy).not.toHaveBeenCalled();
            restate.set({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemB,
            });
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({ type: 'history-state-changed', tabId: 1 });
            spy.mockClear();
            restate.update((state) => ({ ...state, current: historyItemC }));
            restate.update((state) => ({ ...state, current: historyItemB }));
            await immediate();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('tabController.onTabAllClosed property', () => {
        test('it is emitted when all tabs are closed', async () => {
            const tabController = createTabController();
            const spy = jest.fn();
            tabController.onTabAllClosed.addListener(spy);
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            await immediate();
            expect(spy).not.toHaveBeenCalled();
            tabController.removeTab({ id: 1 });
            tabController.removeTab({ id: 2 });
            await immediate();
            expect(spy).not.toHaveBeenCalled();
            tabController.removeTab({ id: 3 });
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('tabController.addTab() method', () => {
        test('it adds a new tab', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemA });
            const historyController1 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: true, historyController: historyController1, id: 1, title: 'a' },
                ],
            });
            historyControllerFactory.create.mockClear();
            tabController.addTab({ active: false });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemA });
            const historyController2 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: true, historyController: historyController1, id: 1, title: 'a' },
                    { active: false, historyController: historyController2, id: 2, title: 'a' },
                ],
            });
            historyControllerFactory.create.mockClear();
        });

        test('it creates a history controller with the passed initial history item', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true, historyItem: historyItemB });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemB });
            const historyController1 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [{ active: true, historyController: historyController1, id: 1, title: 'b' }],
            });
        });

        test('it deactivates existing tabs if the activate parameter is true', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true, historyItem: historyItemB });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemB });
            const historyController1 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: true, historyController: historyController1, id: 1, title: 'b' },
                ],
            });
            historyControllerFactory.create.mockClear();
            tabController.addTab({ active: true, historyItem: historyItemC });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemC });
            const historyController2 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyController1, id: 1, title: 'b' },
                    { active: true, historyController: historyController2, id: 2, title: 'c' },
                ],
            });
            historyControllerFactory.create.mockClear();
            tabController.addTab({ active: true, historyItem: historyItemD });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemD });
            const historyController3 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyController1, id: 1, title: 'b' },
                    { active: false, historyController: historyController2, id: 2, title: 'c' },
                    { active: true, historyController: historyController3, id: 3, title: 'd' },
                ],
            });
            historyControllerFactory.create.mockClear();
        });

        test('it always activates the new tab if no tab exists', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: false });
            await immediate();
            expect(historyControllerFactory.create).toHaveBeenCalledTimes(1);
            expect(historyControllerFactory.create).toHaveBeenCalledWith({ initialHistoryItem: historyItemA });
            const historyController1 = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [{ active: true, historyController: historyController1, id: 1, title: 'a' }],
            });
            historyControllerFactory.create.mockClear();
        });

        test('it updates the title of the new tab when the history changed', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            await immediate();
            const restate = new Restate({
                ableToGoBack: false,
                ableToGoForward: false,
                current: historyItemB,
            });
            const historyController = { ...defaultHistoryController, state: restate.state };
            historyControllerFactory.create.mockReturnValueOnce(historyController);
            tabController.addTab({ active: true, historyItem: historyItemB });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController, id: 1, title: 'a' },
                    { active: true, historyController, id: 2, title: 'b' },
                ],
            });
            restate.update((state) => ({ ...state, current: historyItemC }));
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController, id: 1, title: 'a' },
                    { active: true, historyController, id: 2, title: 'c' },
                ],
            });
        });
    });

    describe('tabController.removeTab() method', () => {
        test('it removes the tab', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.selectTab({ id: 3 });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                    { active: false, historyController: historyControllers[3], id: 4, title: 'a' },
                    { active: false, historyController: historyControllers[4], id: 5, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 4 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                    { active: false, historyController: historyControllers[4], id: 5, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 5 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
        });

        test('it changes the active tab', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.selectTab({ id: 3 });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                    { active: false, historyController: historyControllers[3], id: 4, title: 'a' },
                    { active: false, historyController: historyControllers[4], id: 5, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 3 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[3], id: 4, title: 'a' },
                    { active: false, historyController: historyControllers[4], id: 5, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 4 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[4], id: 5, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 5 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: true, historyController: historyControllers[1], id: 2, title: 'a' },
                ],
            });
        });

        test('it ignores non-exist ids', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 4 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.removeTab({ id: 5 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
        });
    });

    describe('tabController.selectTab() method', () => {
        test('it changes the active tab', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectTab({ id: 1 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: true, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: false, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectTab({ id: 2 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: true, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: false, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
        });

        test('it ignores non-exist ids', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectTab({ id: 4 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectTab({ id: 3 });
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
        });
    });

    describe('tabController.selectNextTab() method', () => {
        test('it changes the active tab', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectNextTab();
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: true, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: false, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectNextTab();
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: true, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: false, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
        });

        test('it does nothing if no or only one tab exists', async () => {
            const tabController = createTabController();
            await immediate();
            expect(tabController.state.current).toEqual({ tabs: [] });
            tabController.selectNextTab();
            await immediate();
            expect(tabController.state.current).toEqual({ tabs: [] });
            tabController.addTab({ active: true });
            await immediate();
            const historyController = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [{ active: true, historyController, id: 1, title: 'a' }],
            });
            tabController.selectNextTab();
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [{ active: true, historyController, id: 1, title: 'a' }],
            });
        });
    });

    describe('tabController.selectPreviousTab() method', () => {
        test('it changes the active tab', async () => {
            const tabController = createTabController();
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            tabController.addTab({ active: true });
            await immediate();
            const historyControllers = historyControllerFactory.create.mock.results.map(({ value }) => value);
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: true, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectPreviousTab();
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: false, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: true, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: false, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
            tabController.selectPreviousTab();
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [
                    { active: true, historyController: historyControllers[0], id: 1, title: 'a' },
                    { active: false, historyController: historyControllers[1], id: 2, title: 'a' },
                    { active: false, historyController: historyControllers[2], id: 3, title: 'a' },
                ],
            });
        });

        test('it does nothing if no or only one tab exists', async () => {
            const tabController = createTabController();
            await immediate();
            expect(tabController.state.current).toEqual({ tabs: [] });
            tabController.selectPreviousTab();
            await immediate();
            expect(tabController.state.current).toEqual({ tabs: [] });
            tabController.addTab({ active: true });
            await immediate();
            const historyController = historyControllerFactory.create.mock.results[0].value;
            expect(tabController.state.current).toEqual({
                tabs: [{ active: true, historyController, id: 1, title: 'a' }],
            });
            tabController.selectPreviousTab();
            await immediate();
            expect(tabController.state.current).toEqual({
                tabs: [{ active: true, historyController, id: 1, title: 'a' }],
            });
        });
    });
});
