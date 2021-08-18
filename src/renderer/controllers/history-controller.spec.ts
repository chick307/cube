import { Entry, FileSystem } from '../../common/entities';
import { HistoryStore } from '../stores/history-store';
import { HistoryControllerImpl } from './history-controller';

class UnknownFileSystem extends FileSystem {}

const dummyEntry = Entry.fromJson({ type: 'directory', path: '/a' });

const dummyFileSystem = new UnknownFileSystem();

const createHistoryStore = () => {
    return new HistoryStore({
        historyState: {
            entry: Entry.fromJson({ type: 'directory', path: '/a' }),
            fileSystem: dummyFileSystem,
        },
    });
};

describe('HistoryContollerImpl class', () => {
    describe('historyController.goBack() method', () => {
        test('it calls historyStore.shiftBack() method', () => {
            const dummyHistoryStore = createHistoryStore();
            const shiftBack = jest.spyOn(dummyHistoryStore, 'shiftBack');
            const historyController = new HistoryControllerImpl({
                historyStore: dummyHistoryStore,
            });

            expect(shiftBack).not.toBeCalled();
            historyController.goBack();
            expect(shiftBack).toBeCalledTimes(1);

            shiftBack.mockReset();
            shiftBack.mockRestore();
        });
    });

    describe('historyController.goForward() method', () => {
        test('it calls historyStore.shiftForward() method', () => {
            const dummyHistoryStore = createHistoryStore();
            const shiftForward = jest.spyOn(dummyHistoryStore, 'shiftForward');
            const historyController = new HistoryControllerImpl({
                historyStore: dummyHistoryStore,
            });

            expect(shiftForward).not.toBeCalled();
            historyController.goForward();
            expect(shiftForward).toBeCalledTimes(1);

            shiftForward.mockReset();
            shiftForward.mockRestore();
        });
    });

    describe('historyController.navigate() method', () => {
        test('it calls historyStore.push() method', () => {
            const dummyHistoryStore = createHistoryStore();
            const push = jest.spyOn(dummyHistoryStore, 'push');
            const historyController = new HistoryControllerImpl({
                historyStore: dummyHistoryStore,
            });

            expect(push).not.toBeCalled();
            historyController.navigate({
                entry: dummyEntry,
                fileSystem: dummyFileSystem,
            });
            expect(push).toBeCalledTimes(1);
            expect(push).toBeCalledWith({
                entry: dummyEntry,
                fileSystem: dummyFileSystem,
            });

            push.mockReset();
            push.mockRestore();
        });
    });

    describe('historyController.replace() method', () => {
        test('it calls historyStore.replace() method', () => {
            const dummyHistoryStore = createHistoryStore();
            const replace = jest.spyOn(dummyHistoryStore, 'replace');
            const historyController = new HistoryControllerImpl({
                historyStore: dummyHistoryStore,
            });

            expect(replace).not.toBeCalled();
            historyController.replace({
                entry: dummyEntry,
                fileSystem: dummyFileSystem,
            });
            expect(replace).toBeCalledTimes(1);
            expect(replace).toBeCalledWith({
                entry: dummyEntry,
                fileSystem: dummyFileSystem,
            });

            replace.mockReset();
            replace.mockRestore();
        });
    });
});
