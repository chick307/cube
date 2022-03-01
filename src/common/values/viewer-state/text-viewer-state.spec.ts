import { TextViewerState } from '../viewer-state';

describe('TextViewerState class', () => {
    describe('TextViewerState.fromJson() method', () => {
        test('it returns an instance of TextViewerState class', () => {
            expect(TextViewerState.fromJson({ type: 'text' })).toEqual(new TextViewerState());
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => TextViewerState.fromJson(null)).toThrow();
            expect(() => TextViewerState.fromJson({})).toThrow();
            expect(() => TextViewerState.fromJson({ type: '' })).toThrow();
            expect(() => TextViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('textViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new TextViewerState().toJson()).toEqual({ type: 'text' });
        });
    });
});
