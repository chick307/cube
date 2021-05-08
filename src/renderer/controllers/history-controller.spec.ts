import { Entry } from '../../common/entities/entry';
import { EntryPath } from '../../common/values/entry-path';
import type { FileSystem } from '../services/file-system';
import { HistoryControllerImpl } from './history-controller';

const dummyEntry = new Entry(new EntryPath('/a'));

const dummyFileSystem: FileSystem = {
    getContainer: () => null,
    readDirectory: () => Promise.resolve([]),
    readFile: () => Promise.resolve(Buffer.from('')),
    readLink: () => Promise.resolve(dummyEntry),
};

const dummyHistoryStore = {
    pop: () => {},
    push: () => {},
    replace: () => {},
};

describe('HistoryContollerImpl class', () => {
    describe('historyController.goBack() method', () => {
        test('it calls historyStore.pop() method', () => {
            const pop = jest.spyOn(dummyHistoryStore, 'pop');
            const historyController = new HistoryControllerImpl({
                historyStore: dummyHistoryStore,
            });

            expect(pop).not.toBeCalled();
            historyController.goBack();
            expect(pop).toBeCalledTimes(1);

            pop.mockReset();
            pop.mockRestore();
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
