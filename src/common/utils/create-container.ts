export const get = Symbol('get');

export type Container<T> = {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [K in keyof T]: (
        T[K] extends { [get]: (...args: any[]) => any; } ? (
            T[K] extends { [get]: () => infer U; } ? U :
            T[K] extends { [get]: (container: infer C) => infer U; } ? (
                keyof C extends Exclude<keyof T, K> ? (
                    C extends Pick<Container<Omit<T, K>>, keyof C> ? U :
                    never
                ) :
                never
            ) :
            never
        ) :
        T[K] extends new (...args: any[]) => any ? (
            T[K] extends new () => infer U ? U :
            T[K] extends new (container: infer C) => infer U ? (
                keyof C extends Exclude<keyof T, K> ? (
                    Container<Omit<T, K>> extends C ? U :
                    never
                ) :
                never
            ) :
            never
        ) :
        T[K]
    );
    /* eslint-enable */
};

export type Factory<T, U> =
    ((container: T) => U) &
    {
        [get]: (container: T) => U;
    };

export const createFactory = <U, T = void>(factory: (container: T) => U): Factory<T, U> => {
    const f = (container: T): U => {
        const value = factory(container);
        return value;
    };
    return Object.assign(f, {
        [get]: f,
    });
};

export const createContainer = <T>(services: T): {
    readonly [K in keyof Container<T>]: Container<T>[K];
} => {
    const container = Object.create(null) as Container<T>;
    const values = Object.create(null);
    const innerContainer = new Proxy(container, {
        get: (target, key) => {
            const value = Reflect.get(target, key);
            if (value === undefined && !(key in target))
                throw Error('Unresolvable dependency depected');
            return value;
        },
    });
    for (const [key, value] of Object.entries(services)) {
        Object.defineProperty(container, key, {
            enumerable: true,
            get: () => {
                if (key in values) {
                    if (!values[key].constructed)
                        throw Error('Circular dependency detected');
                    return values[key].value;
                }
                values[key] = { constructed: false };
                values[key].value =
                    value == null ? value :
                    typeof value[get] === 'function' ? value[get](innerContainer) :
                    typeof value === 'function' ? new value(innerContainer) :
                    value;
                values[key].constructed = true;
                return values[key].value;
            },
        });
    }
    return container;
};
