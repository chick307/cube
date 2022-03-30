import { Point } from '../point';
import { TextViewerState } from '../viewer-state';

const defaultJson = { type: 'text', scrollPosition: { x: 0, y: 0 } };

describe('TextViewerState class', () => {
    describe('TextViewerState.fromJson() method', () => {
        test('it returns an instance of TextViewerState class', () => {
            expect(TextViewerState.fromJson({ type: 'text' })).toEqual(new TextViewerState());
            expect(TextViewerState.fromJson({ type: 'text', scrollPosition: { x: 10, y: 20 } }))
                .toEqual(new TextViewerState({ scrollPosition: new Point(10, 20) }));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => TextViewerState.fromJson(null)).toThrow();
            expect(() => TextViewerState.fromJson({})).toThrow();
            expect(() => TextViewerState.fromJson({ type: '' })).toThrow();
            expect(() => TextViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('textViewerState.setScrollPosition() method', () => {
        test('it creates a new state', () => {
            expect(new TextViewerState().setScrollPosition(new Point(3, 14)))
                .toEqual(new TextViewerState({ scrollPosition: new Point(3, 14) }));
            expect(new TextViewerState({ scrollPosition: new Point(1, 12) }).setScrollPosition(new Point(3, 58)))
                .toEqual(new TextViewerState({ scrollPosition: new Point(3, 58) }));
        });
    });

    describe('textViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new TextViewerState().toJson()).toEqual({ ...defaultJson });
            expect(new TextViewerState({ scrollPosition: new Point(10, 20) }).toJson())
                .toEqual({ ...defaultJson, scrollPosition: { x: 10, y: 20 } });
        });
    });
});
