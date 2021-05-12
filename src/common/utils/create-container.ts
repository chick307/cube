export const get = Symbol('get');

export type Container<T> = {
    [K in keyof T]:
        T[K] extends { [get]: (container: Container<Omit<T, K>>) => infer U; } ? U :
        T[K] extends new (...args: any[]) => infer U ? U :
        T[K];
};

export type Factory<T, U> =
    ((container: T) => U) &
    {
        [get]: (container: T) => U;
    };

export const createFactory = <T, U>(factory: (container: T) => U): Factory<T, U> => {
    const f = (container: T): U => {
        const value = factory(container);
        return value;
    };
    return Object.assign(f, {
        [get]: f,
    });
};

export const createContainer = <T>(services: T): Container<T> => {
    const container = Object.create(null) as Container<T>;
    const values = Object.create(null) as any;
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
