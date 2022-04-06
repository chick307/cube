import { Point } from './point';

describe('Point class', () => {
    describe('Point.fromJson() method', () => {
        test('it creates a new instance of Point class', () => {
            expect(Point.fromJson({ x: 0, y: 0 })).toEqual(Point.zero);
            expect(Point.fromJson({ x: 1, y: 23 })).toEqual(new Point(1, 23));
        });

        test('it throws an error if the passed JSON is invalid', () => {
            expect(() => Point.fromJson(null)).toThrow();
            expect(() => Point.fromJson(undefined)).toThrow();
            expect(() => Point.fromJson({})).toThrow();
            expect(() => Point.fromJson({ x: 1 })).toThrow();
            expect(() => Point.fromJson({ x: 1, y: '23' })).toThrow();
            expect(() => Point.fromJson({ x: 1, y: undefined })).toThrow();
            expect(() => Point.fromJson({ y: 1 })).toThrow();
            expect(() => Point.fromJson({ x: '1', y: 23 })).toThrow();
            expect(() => Point.fromJson({ x: undefined, y: 23 })).toThrow();
        });
    });

    describe('point.equals() method', () => {
        test('it returns whether ', () => {
            expect(new Point(0, 0).equals(Point.zero)).toBe(true);
            expect(new Point(1, 23).equals(new Point(1, 23))).toBe(true);
            expect(new Point(0, 0).equals(new Point(0, 12))).toBe(false);
            expect(new Point(0, 0).equals(new Point(21, 0))).toBe(false);
            expect(new Point(0, 0).equals(new Point(1, 23))).toBe(false);
            expect(new Point(0, 12).equals(Point.zero)).toBe(false);
            expect(new Point(21, 0).equals(Point.zero)).toBe(false);
            expect(new Point(1, 23).equals(Point.zero)).toBe(false);
            expect(new Point(0, 0).equals(null)).toBe(false);
            expect(new Point(1, 23).equals(undefined)).toBe(false);
        });
    });

    describe('point.toJson() method', () => {
        test('it returns a JSON object', () => {
            expect(Point.zero.toJson()).toEqual({ x: 0, y: 0 });
            expect(new Point(1, 23).toJson()).toEqual({ x: 1, y: 23 });
        });
    });
});
