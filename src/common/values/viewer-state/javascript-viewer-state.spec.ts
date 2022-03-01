import { JavaScriptViewerState } from '../viewer-state';

describe('JavaScriptViewerState class', () => {
    describe('JavaScriptViewerState.fromJson() method', () => {
        test('it returns an instance of JavaScriptViewerState class', () => {
            expect(JavaScriptViewerState.fromJson({ type: 'javascript' })).toEqual(new JavaScriptViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => JavaScriptViewerState.fromJson(null)).toThrow();
            expect(() => JavaScriptViewerState.fromJson({})).toThrow();
            expect(() => JavaScriptViewerState.fromJson({ type: '' })).toThrow();
            expect(() => JavaScriptViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('javascriptViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new JavaScriptViewerState().toJson()).toEqual({ type: 'javascript' });
        });
    });
});
