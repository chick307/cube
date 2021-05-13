import { createContainer, createFactory } from './create-container';

class TestService1 {
    readonly a: number;

    readonly b: string;

    constructor(container: {
        a: number;
        b: string;
    }) {
        this.a = container.a;
        this.b = container.b;
    }
}

class TestService2 {
    readonly testService1: TestService1;

    constructor(container: {
        testService1: TestService1;
    }) {
        this.testService1 = container.testService1;
    }
}

class TestService3 {
    readonly testService1: TestService1;

    constructor(container: {
        testService1: TestService1;
    }) {
        this.testService1 = container.testService1;
    }
}

class TestService4 {
    readonly testService2: TestService2;

    readonly testService3: TestService3;

    constructor(container: {
        testService2: TestService2;
        testService3: TestService3;
    }) {
        this.testService2 = container.testService2;
        this.testService3 = container.testService3;
    }
}

class TestService5 {
    constructor(container: {
        testService6: TestService6;
    }) {
        container.testService6;
    }
}

class TestService6 {
    constructor(container: {
        testService5: TestService5;
    }) {
        container.testService5;
    }
}

describe('createContainer() method', () => {
    test('it creates an object from the argument', () => {
        const container = createContainer({
            a: 1,
            b: 'abc',
            c: null,
            d: createFactory(({ a, b, c }: { a: number; b: string; c: any; }) => ({ a, b, c })),
            testService4: TestService4,
            testService3: TestService3,
            testService2: TestService2,
            testService1: TestService1,
        });
        expect(container).toEqual({
            a: 1,
            b: 'abc',
            c: null,
            d: { a: 1, b: 'abc', c: null },
            testService4: new TestService4({
                testService2: new TestService2({
                    testService1: new TestService1({ a: 1, b: 'abc' }),
                }),
                testService3: new TestService3({
                    testService1: new TestService1({ a: 1, b: 'abc' }),
                }),
            }),
            testService3: new TestService3({
                testService1: new TestService1({ a: 1, b: 'abc' }),
            }),
            testService2: new TestService2({
                testService1: new TestService1({ a: 1, b: 'abc' }),
            }),
            testService1: new TestService1({ a: 1, b: 'abc' }),
        });
        expect(container.testService2.testService1).toBe(container.testService1);
        expect(container.testService3.testService1).toBe(container.testService1);
        expect(container.testService4.testService2).toBe(container.testService2);
        expect(container.testService4.testService3).toBe(container.testService3);
    });

    test('it throws an error if circular dependency detected', () => {
        const container = createContainer({
            testService5: TestService5,
            testService6: TestService6,
        });
        expect(() => {
            container.testService5;
        }).toThrow();
        expect(() => {
            container.testService6;
        }).toThrow();
    });

    test('it throws an error if unresolvable dependency detected', () => {
        const container = createContainer({
            testService5: TestService5,
        });
        expect(() => {
            container.testService5;
        }).toThrow();
    });
});
