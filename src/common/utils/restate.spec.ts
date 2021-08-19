import { CloseController } from './close-controller';
import { immediate } from './immediate';
import { Restate, State } from './restate';

describe('Restate class', () => {
    test('it can be used as written in README', async () => {
        const restate = new Restate<{ counter: number; }>({ counter: 1 });
        expect(restate.state.current).toEqual({ counter: 1 });

        await restate.set({ counter: 2 });
        expect(restate.state.current).toEqual({ counter: 2 });

        const updater = jest.fn((state: { counter: number; }) => ({ counter: state.counter + 1 }));
        await restate.update(updater);
        expect(updater).toHaveBeenCalledTimes(1);
        expect(updater).toHaveBeenCalledWith({ counter: 2 });
        expect(restate.state.current).toEqual({ counter: 3 });

        restate.update((state) => ({ counter: state.counter + 1 }));
        restate.update((state) => ({ counter: state.counter + 1 }));
        restate.update((state) => ({ counter: state.counter + 1 }));
        await expect(restate.state.next()).resolves.toEqual({ counter: 6 });

        let done = false;
        (async () => {
            await immediate();
            restate.update((state) => ({ counter: state.counter + 1 }));
            await immediate();
            restate.update((state) => ({ counter: state.counter + 1 }));
            await immediate();
            restate.update((state) => ({ counter: state.counter + 1 }));
            done = true;
        })();

        const recorder = jest.fn();
        for await (const value of restate.state) {
            recorder(value);
            if (done)
                break;
        }
        expect(recorder).toHaveBeenCalledTimes(3);
        expect(recorder).toHaveBeenNthCalledWith(1, { counter: 7 });
        expect(recorder).toHaveBeenNthCalledWith(2, { counter: 8 });
        expect(recorder).toHaveBeenNthCalledWith(3, { counter: 9 });
    });

    describe('restate.set() method', () => {
        test('it updates the state with the passed value asynchronously', async () => {
            const restate = new Restate(0);
            {
                const next = restate.state.next();
                const promise = restate.set(1);
                expect(restate.state.current).toBe(0);
                await promise;
                expect(restate.state.current).toBe(1);
                await expect(next).resolves.toBe(1);
            }
            {
                const next = restate.state.next();
                const promise = restate.set(2);
                expect(restate.state.current).toBe(1);
                await promise;
                expect(restate.state.current).toBe(2);
                await expect(next).resolves.toBe(2);
            }
        });

        test('it updates the generation of the state asynchronously', async () => {
            const restate = new Restate(0);
            const knownGenerations = new Set([restate.state.generation]);
            {
                const promise = restate.set(1);
                expect(knownGenerations.has(restate.state.generation)).toBe(true);
                await promise;
                expect(knownGenerations.has(restate.state.generation)).toBe(false);
                knownGenerations.add(restate.state.generation);
            }
            {
                const promise = restate.set(2);
                expect(knownGenerations.has(restate.state.generation)).toBe(true);
                await promise;
                expect(knownGenerations.has(restate.state.generation)).toBe(false);
                knownGenerations.add(restate.state.generation);
            }
        });
    });

    describe('restate.update() method', () => {
        test('it updates the state with the passed function asynchronously', async () => {
            const restate = new Restate(0);
            const increment = jest.fn((x: number) => x + 1);
            {
                const next = restate.state.next();
                const promise = restate.update(increment);
                expect(restate.state.current).toBe(0);
                await promise;
                expect(restate.state.current).toBe(1);
                await expect(next).resolves.toBe(1);
            }
            {
                const next = restate.state.next();
                const promise = restate.update(increment);
                expect(restate.state.current).toBe(1);
                await promise;
                expect(restate.state.current).toBe(2);
                await expect(next).resolves.toBe(2);
            }
        });
    });
});

describe('State class', () => {
    describe('State.merge() method', () => {
        test('it returns a new state object', async () => {
            const restate1 = new Restate(1);
            const restate2 = new Restate('a');
            const state = State.merge([
                restate1.state,
                restate2.state,
                { current: true, generation: 0, next: () => Promise.resolve(true) },
            ]);
            expect(state.current).toEqual([1, 'a', true]);
            await restate1.update(() => 2);
            await immediate();
            expect(state.current).toEqual([2, 'a', true]);
            await restate2.update(() => 'b');
            await immediate();
            expect(state.current).toEqual([2, 'b', true]);
            restate1.update(() => 3);
            restate2.update(() => 'c');
            await expect(state.next()).resolves.toEqual([3, 'c', true]);
        });
    });

    describe('State.of() method', () => {
        test('it returns a new state object', async () => {
            const state = State.of(123);
            expect(state.current).toBe(123);
            const { generation } = state;
            await expect(state.next()).resolves.toBe(123);
            expect(state.generation === generation);
            for await (const value of state)
                throw Error(`unreachable ${value}`);
            expect(state.current).toBe(123);
            expect(state.generation === generation);
        });
    });

    describe('state.forEach() method', () => {
        test('it invokes the passed callback function for each update', async () => {
            const restate = new Restate(1);
            const spy = jest.fn();
            restate.state.forEach(spy);
            restate.set(2);
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(2);
            spy.mockClear();
            restate.set(3);
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(3);
            spy.mockClear();
        });

        test('it waits for the callback function asynchronously', async () => {
            const restate = new Restate(1);
            let resolve = () => {};
            const spy = jest.fn((): void | Promise<void> => new Promise<void>((r) => {
                resolve = r;
            }));
            restate.state.forEach(spy);
            restate.set(2);
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(2);
            spy.mockClear();
            restate.set(3);
            await immediate();
            expect(spy).not.toHaveBeenCalled();
            resolve();
            spy.mockImplementation(() => {});
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(3);
            spy.mockClear();
        });

        test('it can be aborted by the passed close signal', async () => {
            const closeController = new CloseController();
            const restate = new Restate(1);
            const spy = jest.fn();
            restate.state.forEach(spy, { signal: closeController.signal });
            restate.set(2);
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockClear();
            restate.set(3);
            await immediate();
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockClear();
            closeController.close();
            restate.set(4);
            await immediate();
            expect(spy).not.toHaveBeenCalled();
            restate.set(5);
            await immediate();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('state.map() method', () => {
        test('it returns a new state object', async () => {
            const restate = new Restate(5);
            const state = restate.state.map((state) => state * 2);
            expect(state.current).toBe(10);
            restate.update(() => 10);
            await expect(state.next()).resolves.toBe(20);
            restate.update(() => 15);
            await expect(state.next()).resolves.toBe(30);
        });

        test('it memoizes results of the callback function', async () => {
            const restate = new Restate(5);
            const callback = jest.fn((state) => state * 2);
            const state = restate.state.map(callback);
            expect(callback).not.toHaveBeenCalled();
            restate.update(() => 6);
            await state.next();
            expect(callback).toHaveBeenCalledTimes(1);
            callback.mockClear();
            await restate.update(() => 10);
            expect(callback).not.toHaveBeenCalled();
            await restate.update(() => 15);
            expect(callback).not.toHaveBeenCalled();
            state.current;
            state.current;
            state.current;
            expect(callback).toHaveBeenCalledTimes(1);
            callback.mockClear();
            const constantState = State.of(123).map(callback);
            expect(callback).not.toHaveBeenCalled();
            await constantState.next();
            expect(callback).toHaveBeenCalledTimes(1);
            callback.mockClear();
            await constantState.next();
            expect(callback).not.toHaveBeenCalled();
        });

        test('it returns the state which has the same generations as the original state', async () => {
            const restate = new Restate(5);
            const state = restate.state.map((state) => state * 2);
            expect(restate.state.generation).toBe(state.generation);
            await restate.update(() => 10);
            state.current;
            expect(restate.state.generation).toBe(state.generation);
            await restate.update(() => 15);
            expect(restate.state.generation).toBe(state.generation);
        });
    });

    describe('state[Symbol.asyncIterator]() method', () => {
        test('it returns an instance of AsyncIterator', async () => {
            const restate = new Restate(0);
            const iterator = restate.state[Symbol.asyncIterator]();
            try {
                restate.update(() => 1);
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 1 });
                restate.update(() => 2);
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 2 });
                restate.update(() => 3);
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 3 });
            } finally {
                iterator.return();
            }
        });

        test('it regards updates in microtasks as one', async () => {
            const restate = new Restate(0);
            const iterator = restate.state[Symbol.asyncIterator]();
            try {
                restate.update(() => 1);
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 1 });
                restate.update(() => 2);
                restate.update(() => 3);
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 3 });
                Promise.resolve().then(() => restate.update(() => 4));
                Promise.resolve().then(() => restate.update(() => 5));
                Promise.resolve().then(() => restate.update(() => 6));
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 6 });
            } finally {
                iterator.return();
            }
        });

        test('it skips updates until the next iteration', async () => {
            const restate = new Restate(0);
            const iterator = restate.state[Symbol.asyncIterator]();
            try {
                const promise = iterator.next();
                restate.update(() => 1);
                await expect(promise).resolves.toEqual({ done: false, value: 1 });
                restate.update(() => 2);
                await immediate();
                restate.update(() => 3);
                await immediate();
                restate.update(() => 4);
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 3 });
                await expect(iterator.next()).resolves.toEqual({ done: false, value: 4 });
            } finally {
                iterator.return();
            }
        });

        test('it returns an AsyncIterableIterator object', () => {
            const state = new State({ current: 123, generation: 0, next: () => Promise.resolve(123) });
            const iterator = state[Symbol.asyncIterator]();
            expect(iterator[Symbol.asyncIterator]()).toBe(iterator);
        });
    });
});
