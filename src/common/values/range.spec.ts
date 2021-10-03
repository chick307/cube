import { Range } from './range';

describe('Range class', () => {
    describe('range.clamp() method', () => {
        test('it returns the value clamped to the inclusive range', () => {
            expect(new Range({ min: 0, max: 10 }).clamp(-10)).toBe(0);
            expect(new Range({ min: 0, max: 10 }).clamp(0)).toBe(0);
            expect(new Range({ min: 0, max: 10 }).clamp(5)).toBe(5);
            expect(new Range({ min: 0, max: 10 }).clamp(10)).toBe(10);
            expect(new Range({ min: 0, max: 10 }).clamp(20)).toBe(10);
        });
    });
});
