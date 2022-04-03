import { Point } from '../point';
import { BinaryViewerState } from '../viewer-state';

const defaultJson = {
    type: 'binary',
    scrollPosition: { x: 0, y: 0 },
};

const scrollPositions = [new Point(0, 0), new Point(10, 20), new Point(33, 44)];

const combinations = [{}]
    .flatMap((values) => scrollPositions.map((v) => ({ ...values, scrollPosition: v })))
    .concat([]);

describe('BinaryViewerState class', () => {
    describe('BinaryViewerState.fromJson() method', () => {
        test('it returns an instance of BinaryViewerState class', () => {
            expect(BinaryViewerState.fromJson({ type: 'binary' })).toEqual(new BinaryViewerState());
            expect(BinaryViewerState.fromJson({ type: 'binary', scrollPosition: { x: 10, y: 20 } }))
                .toEqual(new BinaryViewerState({ scrollPosition: new Point(10, 20) }));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => BinaryViewerState.fromJson(null)).toThrow();
            expect(() => BinaryViewerState.fromJson({})).toThrow();
            expect(() => BinaryViewerState.fromJson({ type: '' })).toThrow();
            expect(() => BinaryViewerState.fromJson({ type: 'text' })).toThrow();
        });
    });

    describe('binaryViewerState.equals() method', () => {
        test('it returns whether the passed object has the same values', () => {
            for (let i = 0; i < combinations.length; i++) {
                const a = new BinaryViewerState(combinations[i]);
                expect(a.equals(null)).toBe(false);
                expect(a.equals(undefined)).toBe(false);
                expect(a.equals(a)).toBe(true);
                for (let j = 0; j < combinations.length; j++) {
                    const b = new BinaryViewerState(combinations[j]);
                    if (i === j) {
                        expect(a.equals(b)).toBe(true);
                    } else {
                        expect(a.equals(b)).toBe(false);
                    }
                }
            }
        });
    });

    describe('textViewerState.setScrollPosition() method', () => {
        test('it creates a new state', () => {
            for (let i = 0; i < combinations.length; i++) {
                const a = new BinaryViewerState(combinations[i]);
                for (let j = 0; j < scrollPositions.length; j++) {
                    expect(a.setScrollPosition(scrollPositions[j]))
                        .toEqual(new BinaryViewerState({ ...combinations[i], scrollPosition: scrollPositions[j] }));
                }
            }
        });
    });

    describe('binaryViewerState.toJson() method', () => {
        test('it returns JSON object', () => {
            expect(new BinaryViewerState().toJson()).toEqual({ ...defaultJson });
        });
    });
});
