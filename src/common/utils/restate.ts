import { CloseController, CloseSignal } from './close-controller';

export type StateLike<T> = {
    readonly current: T;

    readonly generation: number;

    next(): PromiseLike<T>;
};

export class StateIterator<T> implements AsyncIterable<T>, AsyncIterator<T> {
    #generation: number;

    #state: State<T>;

    constructor(state: State<T>) {
        this.#generation = state.generation;
        this.#state = state;
    }

    async next(): Promise<IteratorResult<T, T>> {
        if (this.#generation === this.#state.generation) {
            await this.#state.next();
            if (this.#generation === this.#state.generation)
                return { done: true, value: this.#state.current };
        }
        this.#generation = this.#state.generation;
        return { done: false, value: this.#state.current };
    }

    async return(): Promise<IteratorResult<T, T>> {
        return { done: false, value: this.#state.current };
    }

    [Symbol.asyncIterator](): this {
        return this;
    }
}

export type MergedState<States extends readonly StateLike<unknown>[]> =
    States extends [] ? readonly [] :
    States extends [StateLike<infer T>, ...infer U] ? (
        U extends StateLike<unknown>[] ? readonly [T, ...MergedState<U>] : never
    ) :
    never;

export type StateLikeTuple<T> = [StateLike<T>, ...StateLike<T>[]];

export class State<T> implements StateLike<T> {
    #state: StateLike<T>;

    constructor(state: StateLike<T>) {
        this.#state = state;
    }

    static merge(states: []): State<readonly []>;

    static merge<States extends StateLikeTuple<unknown>>(states: States): State<MergedState<States>>;

    static merge<T>(states: Iterable<StateLike<T>>): State<readonly T[]>;

    static merge<T>(states: Iterable<StateLike<T>>): State<readonly T[]> {
        const internal = new InternalState(Object.freeze(Array.from(states, (state, index) => {
            (async () => {
                for await (const current of (state instanceof State ? state : new State<T>(state))) {
                    internal.update((prev) => {
                        const next = [...prev];
                        next[index] = current;
                        return Object.freeze(next);
                    });
                }
            })();
            return state.current;
        })));
        return new State(internal);
    }

    static of<T>(state: T): State<T> {
        return new State<T>({
            current: state,
            generation: 0,
            next: () => Promise.resolve(state),
        });
    }

    get current(): T {
        return this.#state.current;
    }

    get generation(): number {
        return this.#state.generation;
    }

    forEach(callback: (state: T) => PromiseLike<void> | void, options?: { signal?: CloseSignal; }): CloseController {
        const closeController = new CloseController();
        options?.signal?.defer(() => closeController.close());
        (async () => {
            let generation = this.#state.generation;
            for (;;) {
                const current = await closeController.signal.wrapPromise(this.#state.next());
                if (generation === this.#state.generation)
                    return;
                generation = this.#state.generation;
                const result = callback(current);
                if (typeof result?.then === 'function')
                    await closeController.signal.wrapPromise(result);
                while (generation !== this.#state.generation) {
                    generation = this.#state.generation;
                    await callback(this.#state.current);
                }
            }
        })().catch(() => {
            //
        });
        return closeController;
    }

    map<U>(callback: (state: T) => U): State<U> {
        const state = this.#state;
        let last: { current: U; generation: number; } | null = null;
        return new State<U>({
            get current() {
                if (last?.generation !== state.generation)
                    last = { current: callback(state.current), generation: state.generation };
                return last.current;
            },
            get generation() {
                return state.generation;
            },
            async next() {
                await state.next();
                if (last?.generation !== state.generation)
                    last = { current: callback(state.current), generation: state.generation };
                return last.current;
            },
        });
    }

    next(): Promise<T> {
        return Promise.resolve(this.#state.next());
    }

    [Symbol.asyncIterator](): StateIterator<T> {
        return new StateIterator<T>(this);
    }
}

class InternalState<T> implements StateLike<T> {
    #current: T;

    #generation = 0;

    #updating = Promise.resolve();

    #listeners = [] as (() => void)[];

    constructor(initialState: T) {
        this.#current = initialState;
    }

    get current(): T {
        return this.#current;
    }

    get generation(): number {
        return this.#generation;
    }

    async next(): Promise<T> {
        await new Promise<void>((resolve) => {
            this.#listeners.push(resolve);
        });
        return this.#current;
    }

    update(callback: (state: T) => PromiseLike<T> | T): Promise<void> {
        const updating = this.#updating = this.#updating.then(async () => {
            this.#current = await callback(this.#current);
            this.#generation = this.#generation + 1 | 0;
            if (updating === this.#updating) {
                const listeners = this.#listeners;
                this.#listeners = [];
                for (const listener of listeners)
                    listener();
            }
        });
        return updating;
    }
}

export class Restate<T> {
    #internal: InternalState<T>;

    #state: State<T>;

    constructor(initialState: T) {
        this.#internal = new InternalState<T>(initialState);
        this.#state = new State(this.#internal);
    }

    get state(): State<T> {
        return this.#state;
    }

    set(state: T): Promise<void> {
        return this.#internal.update(() => state);
    }

    update(callback: (state: T) => PromiseLike<T> | T): Promise<void> {
        return this.#internal.update(callback);
    }
}
