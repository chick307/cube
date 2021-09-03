import { ViewerState } from '../values/viewer-state';
import { Entry } from './entry';
import { FileSystem } from './file-system';
import { HistoryItem } from './history-item';

const entryAJson = { type: 'directory', path: '/a' };
const entryA = Entry.fromJson(entryAJson);
const fileSystemAJson = { type: 'local' };
const fileSystemA = FileSystem.fromJson(fileSystemAJson);
const viewerStateAJson = { type: 'directory' };
const viewerStateA = ViewerState.fromJson(viewerStateAJson);

describe('HistoryItem class', () => {
    describe('HistoryItem.fromJson() method', () => {
        test('it returns an instance of HistoryItem class', () => {
            const json1 = HistoryItem.fromJson({ entry: entryAJson, fileSystem: fileSystemAJson });
            expect(json1).toEqual(new HistoryItem({ entry: entryA, fileSystem: fileSystemA, viewerState: null }));
            const json2 = HistoryItem.fromJson({
                entry: entryAJson,
                fileSystem: fileSystemAJson,
                viewerState: null,
            });
            expect(json2).toEqual(new HistoryItem({ entry: entryA, fileSystem: fileSystemA, viewerState: null }));
            const json3 = HistoryItem.fromJson({
                entry: entryAJson,
                fileSystem: fileSystemAJson,
                viewerState: viewerStateAJson,
            });
            expect(json3).toEqual(new HistoryItem({
                entry: entryA,
                fileSystem: fileSystemA,
                viewerState: viewerStateA,
            }));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => HistoryItem.fromJson(null)).toThrow();
            expect(() => HistoryItem.fromJson({})).toThrow();
            expect(() => HistoryItem.fromJson({ entry: entryAJson })).toThrow();
            expect(() => HistoryItem.fromJson({ fileSystem: fileSystemAJson })).toThrow();
        });
    });

    describe('historyItem.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new HistoryItem({ entry: entryA, fileSystem: fileSystemA }).toJson())
                .toEqual({ entry: entryAJson, fileSystem: fileSystemAJson, viewerState: null });
            expect(new HistoryItem({
                entry: entryA,
                fileSystem: fileSystemA,
                viewerState: viewerStateA,
            }).toJson()).toEqual({
                entry: entryAJson,
                fileSystem: fileSystemAJson,
                viewerState: viewerStateAJson,
            });
        });
    });
});
