import { DirectoryEntry } from '../../common/entities/directory-entry';
import { FileEntry } from '../../common/entities/file-entry';
import { EntryPath } from '../../common/values/entry-path';
import { immediate } from '../../common/utils/immediate';
import { FileSystem } from '../services/file-system';
import { HistoryStore } from './history-store';

const entry1 = new DirectoryEntry(new EntryPath('/a'));
const entry2 = new DirectoryEntry(new EntryPath('/a/b'));
const entry3 = new FileEntry(new EntryPath('/a/b/c'));

const fileSystem1: FileSystem = {
    getContainer: () => null,
    readDirectory: (_directoryEntry, signal) => {
        return signal.wrapPromise(Promise.resolve([]));
    },
    readFile: (_fileEntry, signal) => {
        return signal.wrapPromise(Promise.resolve(Buffer.from('')));
    },
    readLink: (_symbolicLinkEntry, signal) => {
        return signal.wrapPromise(Promise.resolve(entry3));
    },
};

const historyState1 = { entry: entry1, fileSystem: fileSystem1 };
const historyState2 = { entry: entry2, fileSystem: fileSystem1 };
const historyState3 = { entry: entry3, fileSystem: fileSystem1 };

describe('HistoryStore class', () => {
    describe('historyStore.push() method', () => {
        test('it appends to histories', async () => {
            const historyStore = new HistoryStore({
                historyState: historyState1,
            });
            historyStore.push(historyState2);
            await immediate();
            expect(historyStore.state).toEqual({
                ableToGoBack: true,
                backHistories: [historyState1],
                current: historyState2,
                forwardHistories: [],
            });
        });

        test('it clears forward histories', async () => {
            const historyStore = new HistoryStore({
                historyState: historyState1,
            });
            historyStore.push(historyState2);
            historyStore.push(historyState3);
            historyStore.shiftBack();
            historyStore.shiftBack();
            historyStore.push(historyState3);
            await immediate();
            expect(historyStore.state).toEqual({
                ableToGoBack: true,
                backHistories: [historyState1],
                current: historyState3,
                forwardHistories: [],
            });
        });
    });

    describe('historyStore.replace() method', () => {
        test('it replaces current history', async () => {
            const historyStore = new HistoryStore({
                historyState: historyState1,
            });
            historyStore.replace(historyState2);
            await immediate();
            expect(historyStore.state).toEqual({
                ableToGoBack: false,
                backHistories: [],
                current: historyState2,
                forwardHistories: [],
            });
        });
    });

    describe('historyStore.shiftBack() method', () => {
        test('it shifts histories back', async () => {
            const historyStore = new HistoryStore({
                historyState: historyState1,
            });
            historyStore.push(historyState2);
            historyStore.push(historyState3);
            historyStore.shiftBack();
            await immediate();
            expect(historyStore.state).toEqual({
                ableToGoBack: true,
                backHistories: [historyState1],
                current: historyState2,
                forwardHistories: [historyState3],
            });
            historyStore.shiftBack();
            await immediate();
            expect(historyStore.state).toEqual({
                ableToGoBack: false,
                backHistories: [],
                current: historyState1,
                forwardHistories: [historyState2, historyState3],
            });
        });

        test('it does nothing if not able to go back', async () => {
            const historyStore = new HistoryStore({
                historyState: historyState1,
            });
            const stateBeforeShiftBack = historyStore.state;
            historyStore.shiftBack();
            await immediate();
            expect(historyStore.state).toEqual(stateBeforeShiftBack);
            expect(historyStore.state).toEqual({
                ableToGoBack: false,
                backHistories: [],
                current: historyState1,
                forwardHistories: [],
            });
        });
    });
});
