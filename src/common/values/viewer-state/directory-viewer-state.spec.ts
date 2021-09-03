import { DirectoryViewerState } from '.';

describe('DirectoryViewerState class', () => {
    describe('DirectoryViewerState.fromJson() method', () => {
        test('it returns an instance of DirectoryViewerState class', () => {
            expect(DirectoryViewerState.fromJson({ type: 'directory' })).toEqual(new DirectoryViewerState());
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
            expect(new DirectoryViewerState().toJson()).toEqual({ type: 'directory' });
        });
    });
});
