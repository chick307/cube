import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { EntryPath } from '../../common/values/entry-path';
import { HistoryControllerImpl } from './history-controller';

class UnknownFileSystem extends FileSystem {
    //
}

const dummyEntry = new Entry(new EntryPath('/a'));

const dummyFileSystem = new UnknownFileSystem();

const dummyHistoryStore = {
    push: () => {},
    replace: () => {},
    shiftBack: () => {},
    shiftForward: () => {},
};

describe('HistoryContollerImpl class', () => {
    describe('historyController.goBack() method', () => {
        test('it calls historyStore.shiftBack() method', () => {
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
