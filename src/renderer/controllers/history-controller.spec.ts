import { Entry, FileSystem } from '../../common/entities';
import { immediate } from '../../common/utils/immediate';
import { HistoryStore } from '../stores/history-store';
import { HistoryControllerImpl } from './history-controller';

class UnknownFileSystem extends FileSystem {}
const unknownFileSystem = new UnknownFileSystem();
const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const entryB = Entry.fromJson({ type: 'directory', path: '/a/b' });
const entryC = Entry.fromJson({ type: 'file', path: '/a/b/c' });
const historyStateA = { entry: entryA, fileSystem: unknownFileSystem };
const historyStateB = { entry: entryB, fileSystem: unknownFileSystem };
const historyStateC = { entry: entryC, fileSystem: unknownFileSystem };

describe('HistoryContollerImpl class', () => {
    describe('historyController.goBack() method', () => {
        test('it shifts histories back', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            historyController.navigate(historyStateB);
            historyController.navigate(historyStateC);
            historyController.goBack();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: true,
                backHistories: [historyStateA],
                current: historyStateB,
                forwardHistories: [historyStateC],
            });
            historyController.goBack();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: false,
                ableToGoForward: true,
                backHistories: [],
                current: historyStateA,
                forwardHistories: [historyStateB, historyStateC],
            });
        });

        test('it does nothing if not able to go back', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            const stateBeforeShiftBack = historyController.state.current;
            historyController.goBack();
            await immediate();
            expect(historyController.state.current).toEqual(stateBeforeShiftBack);
            expect(historyController.state.current).toEqual({
                ableToGoBack: false,
                ableToGoForward: false,
                backHistories: [],
                current: historyStateA,
                forwardHistories: [],
            });
        });
    });

    describe('historyController.goForward() method', () => {
        test('it shifts histories forward', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            historyController.navigate(historyStateB);
            historyController.navigate(historyStateC);
            historyController.goBack();
            historyController.goBack();
            historyController.goForward();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: true,
                backHistories: [historyStateA],
                current: historyStateB,
                forwardHistories: [historyStateC],
            });
            historyController.goForward();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                backHistories: [historyStateA, historyStateB],
                current: historyStateC,
                forwardHistories: [],
            });
        });

        test('it does nothing if not able to go back', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            historyController.navigate(historyStateB);
            historyController.navigate(historyStateC);
            await immediate();
            const stateBeforeShiftForward = historyController.state.current;
            historyController.goForward();
            await immediate();
            expect(historyController.state.current).toEqual(stateBeforeShiftForward);
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                backHistories: [historyStateA, historyStateB],
                current: historyStateC,
                forwardHistories: [],
            });
        });
    });

    describe('historyController.navigate() method', () => {
        test('it appends to histories', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            historyController.navigate(historyStateB);
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                backHistories: [historyStateA],
                current: historyStateB,
                forwardHistories: [],
            });
        });

        test('it clears forward histories', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            historyController.navigate(historyStateB);
            historyController.navigate(historyStateC);
            historyController.goBack();
            historyController.goBack();
            historyController.navigate(historyStateC);
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                backHistories: [historyStateA],
                current: historyStateC,
                forwardHistories: [],
            });
        });
    });

    describe('historyController.replace() method', () => {
        test('it replaces current history', async () => {
            const historyStore = new HistoryStore({ historyState: historyStateA });
            const historyController = new HistoryControllerImpl({ historyStore });
            historyController.replace(historyStateB);
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: false,
                ableToGoForward: false,
                backHistories: [],
                current: historyStateB,
                forwardHistories: [],
            });
        });
    });
});
