import { FileSystem } from '../../common/entities';
import { Entry } from '../../common/entities/entry';
import { immediate } from '../../common/utils/immediate';
import { HistoryControllerImpl } from './history-controller';

class UnknownFileSystem extends FileSystem {}
const unknownFileSystem = new UnknownFileSystem();
const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const entryB = Entry.fromJson({ type: 'directory', path: '/a/b' });
const entryC = Entry.fromJson({ type: 'file', path: '/a/b/c' });
const historyItemA = { entry: entryA, fileSystem: unknownFileSystem };
const historyItemB = { entry: entryB, fileSystem: unknownFileSystem };
const historyItemC = { entry: entryC, fileSystem: unknownFileSystem };

describe('HistoryContollerImpl class', () => {
    describe('historyController.goBack() method', () => {
        test('it shifts histories back', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            historyController.navigate(historyItemB);
            historyController.navigate(historyItemC);
            historyController.goBack();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: true,
                current: historyItemB,
            });
            historyController.goBack();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: false,
                ableToGoForward: true,
                current: historyItemA,
            });
        });

        test('it does nothing if not able to go back', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            const stateBeforeShiftBack = historyController.state.current;
            historyController.goBack();
            await immediate();
            expect(historyController.state.current).toEqual(stateBeforeShiftBack);
            expect(historyController.state.current).toEqual({
                ableToGoBack: false,
                ableToGoForward: false,
                current: historyItemA,
            });
        });
    });

    describe('historyController.goForward() method', () => {
        test('it shifts histories forward', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            historyController.navigate(historyItemB);
            historyController.navigate(historyItemC);
            historyController.goBack();
            historyController.goBack();
            historyController.goForward();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: true,
                current: historyItemB,
            });
            historyController.goForward();
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemC,
            });
        });

        test('it does nothing if not able to go back', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            historyController.navigate(historyItemB);
            historyController.navigate(historyItemC);
            await immediate();
            const stateBeforeShiftForward = historyController.state.current;
            historyController.goForward();
            await immediate();
            expect(historyController.state.current).toEqual(stateBeforeShiftForward);
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemC,
            });
        });
    });

    describe('historyController.navigate() method', () => {
        test('it appends to histories', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            historyController.navigate(historyItemB);
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemB,
            });
        });

        test('it clears forward histories', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            historyController.navigate(historyItemB);
            historyController.navigate(historyItemC);
            historyController.goBack();
            historyController.goBack();
            historyController.navigate(historyItemC);
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: true,
                ableToGoForward: false,
                current: historyItemC,
            });
        });
    });

    describe('historyController.replace() method', () => {
        test('it replaces current history', async () => {
            const historyController = new HistoryControllerImpl({ initialHistoryItem: historyItemA });
            historyController.replace(historyItemB);
            await immediate();
            expect(historyController.state.current).toEqual({
                ableToGoBack: false,
                ableToGoForward: false,
                current: historyItemB,
            });
        });
    });
});
