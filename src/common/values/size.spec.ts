import { Size } from './size';

describe('Size class', () => {
    describe('size.equals() method', () => {
        test('it returns whether the passed value equals self', () => {
            expect(new Size({ width: 10, height: 10 }).equals(null)).toBe(false);
            expect(new Size({ width: 10, height: 10 }).equals(undefined)).toBe(false);
            expect(new Size({ width: 10, height: 10 }).equals(new Size({ width: 10, height: 10 }))).toBe(true);
            expect(new Size({ width: 10, height: 10 }).equals(new Size({ width: 20, height: 10 }))).toBe(false);
            expect(new Size({ width: 10, height: 10 }).equals(new Size({ width: 10, height: 30 }))).toBe(false);
        });
    });

    describe('size.joinHorizontally() method', () => {
        test('it creates a joined size object', () => {
            expect(new Size({ width: 10, height: 10 }).joinHorizontally(new Size({ width: 20, height: 10 })))
                .toEqual(new Size({ width: 30, height: 10 }));
            expect(new Size({ width: 20, height: 20 }).joinHorizontally(new Size({ width: 20, height: 10 })))
                .toEqual(new Size({ width: 60, height: 20 }));
            expect(new Size({ width: 10, height: 10 }).joinHorizontally(new Size({ width: 20, height: 20 })))
                .toEqual(new Size({ width: 40, height: 20 }));
        });
    });

    describe('size.scale() method', () => {
        test('it creates a scaled size object', () => {
            expect(new Size({ width: 10, height: 10 }).scale(2)).toEqual(new Size({ width: 20, height: 20 }));
            expect(new Size({ width: 20, height: 30 }).scale(2.5)).toEqual(new Size({ width: 50, height: 75 }));
        });
    });

    describe('size.scaleToFill() method', () => {
        test('it creates a scaled size object', () => {
            expect(new Size({ width: 40, height: 30 }).scaleToFill(new Size({ width: 40, height: 40 })))
                .toEqual(new Size({ width: 40, height: 30 }));
            expect(new Size({ width: 50, height: 40 }).scaleToFill(new Size({ width: 40, height: 20 })))
                .toEqual(new Size({ width: 25, height: 20 }));
            expect(new Size({ width: 40, height: 50 }).scaleToFill(new Size({ width: 20, height: 40 })))
                .toEqual(new Size({ width: 20, height: 25 }));
            expect(new Size({ width: 50, height: 40 }).scaleToFill(new Size({ width: 200, height: 80 })))
                .toEqual(new Size({ width: 100, height: 80 }));
            expect(new Size({ width: 40, height: 50 }).scaleToFill(new Size({ width: 80, height: 200 })))
                .toEqual(new Size({ width: 80, height: 100 }));
        });
    });
});
