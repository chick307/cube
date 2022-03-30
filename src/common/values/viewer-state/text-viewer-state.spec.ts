import { Point } from '../point';
import { TextViewerState } from '../viewer-state';

const defaultJson = {
    type: 'text',
    language: 'plaintext',
    scrollPosition: { x: 0, y: 0 },
};

describe('TextViewerState class', () => {
    describe('TextViewerState.fromJson() method', () => {
        test('it returns an instance of TextViewerState class', () => {
            expect(TextViewerState.fromJson({ type: 'text' })).toEqual(new TextViewerState());
            expect(TextViewerState.fromJson({ type: 'text', scrollPosition: { x: 10, y: 20 } }))
                .toEqual(new TextViewerState({ scrollPosition: new Point(10, 20) }));
            expect(TextViewerState.fromJson({ type: 'text', language: 'javascript' }))
                .toEqual(new TextViewerState({ language: 'javascript' }));
            expect(TextViewerState.fromJson({ type: 'text', language: 'css', scrollPosition: { x: 30, y: 40 } }))
                .toEqual(new TextViewerState({ language: 'css', scrollPosition: new Point(30, 40) }));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => TextViewerState.fromJson(null)).toThrow();
            expect(() => TextViewerState.fromJson({})).toThrow();
            expect(() => TextViewerState.fromJson({ type: '' })).toThrow();
            expect(() => TextViewerState.fromJson({ type: 'binary' })).toThrow();
        });
    });

    describe('textViewerState.setLanguage() method', () => {
        test('it creates a new state', () => {
            expect(new TextViewerState().setLanguage('javascript'))
                .toEqual(new TextViewerState({ language: 'javascript' }));
            expect(new TextViewerState({ language: 'html' }).setLanguage('css'))
                .toEqual(new TextViewerState({ language: 'css' }));
            expect(new TextViewerState({ scrollPosition: new Point(3, 58) }).setLanguage('typescript'))
                .toEqual(new TextViewerState({ language: 'typescript', scrollPosition: new Point(3, 58) }));
        });
    });

    describe('textViewerState.setScrollPosition() method', () => {
        test('it creates a new state', () => {
            expect(new TextViewerState().setScrollPosition(new Point(3, 14)))
                .toEqual(new TextViewerState({ scrollPosition: new Point(3, 14) }));
            expect(new TextViewerState({ scrollPosition: new Point(1, 12) }).setScrollPosition(new Point(3, 58)))
                .toEqual(new TextViewerState({ scrollPosition: new Point(3, 58) }));
            expect(new TextViewerState({ language: 'javascript' }).setScrollPosition(new Point(3, 58)))
                .toEqual(new TextViewerState({ language: 'javascript', scrollPosition: new Point(3, 58) }));
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
