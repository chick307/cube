import { DirectoryViewerState } from '.';

describe('DirectoryViewerState class', () => {
    describe('DirectoryViewerState.fromJson() method', () => {
        test('it returns an instance of DirectoryViewerState class', () => {
            expect(DirectoryViewerState.fromJson({ type: 'directory' })).toEqual(new DirectoryViewerState());
            expect(DirectoryViewerState.fromJson({ type: 'directory' }))
                .toEqual(new DirectoryViewerState({ hiddenEntriesVisible: false }));
            expect(DirectoryViewerState.fromJson({ type: 'directory', hiddenEntriesVisible: false }))
                .toEqual(new DirectoryViewerState());
            expect(DirectoryViewerState.fromJson({ type: 'directory', hiddenEntriesVisible: false }))
                .toEqual(new DirectoryViewerState({ hiddenEntriesVisible: false }));
            expect(DirectoryViewerState.fromJson({ type: 'directory', hiddenEntriesVisible: true }))
                .toEqual(new DirectoryViewerState({ hiddenEntriesVisible: true }));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => DirectoryViewerState.fromJson(null)).toThrow();
            expect(() => DirectoryViewerState.fromJson({})).toThrow();
            expect(() => DirectoryViewerState.fromJson({ type: '' })).toThrow();
            expect(() => DirectoryViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('directoryViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new DirectoryViewerState().toJson()).toEqual({ type: 'directory', hiddenEntriesVisible: false });
            expect(new DirectoryViewerState({ hiddenEntriesVisible: false }).toJson())
                .toEqual({ type: 'directory', hiddenEntriesVisible: false });
            expect(new DirectoryViewerState({ hiddenEntriesVisible: true }).toJson())
                .toEqual({ type: 'directory', hiddenEntriesVisible: true });
        });
    });

    describe('directoryViewerState.toggleHiddenFilesVisible() method', () => {
        test('it creates a new instance of DirectoryViewerState', () => {
            const hidden = new DirectoryViewerState({ hiddenEntriesVisible: false });
            const visible = new DirectoryViewerState({ hiddenEntriesVisible: true });
            expect(hidden.toggleHiddenFilesVisible()).not.toBe(hidden);
            expect(hidden.toggleHiddenFilesVisible()).toEqual(visible);
            expect(visible.toggleHiddenFilesVisible()).not.toBe(visible);
            expect(visible.toggleHiddenFilesVisible()).toEqual(hidden);
        });
    });
});
