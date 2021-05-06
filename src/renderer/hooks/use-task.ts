import React from 'react';

export class Canceled {
    //
}

export type TaskContext = {
    defer: (f: () => void) => void;
    isCanceled: () => boolean;
    wrapPromise: <T>(promise: Promise<T>) => Promise<T>;
};

export type TaskCallback<T> = (context: TaskContext) => Promise<T>;

export const useTask = <T>(f: TaskCallback<T>, deps?: React.DependencyList) => {
    const [result, setResult] = React.useState<[T] | [undefined, any] | []>(() => []);

    React.useEffect(() => {
        const token = Object.create(null);
        let canceled = false;
        let cancel: (() => any) | null = null;
        let canceledPromise: Promise<any> = new Promise<any>((resolve) => {
            cancel = () => {
                resolve(token);
            };
        });

        f({
            defer: (f) => {
                canceledPromise.then(f);
            },
            isCanceled: () => canceled,
            wrapPromise: async <T>(promise: Promise<T>): Promise<T> => {
                const result = await Promise.race([promise, canceledPromise]);
                if (canceled)
                    throw new Canceled();
                return result;
            },
        }).then((r) => {
            setResult([r]);
        }, (e) => {
            setResult([undefined, e]);
        });

        return () => {
            canceled = true;
            if (cancel !== null)
                cancel();
        };
    }, deps);

    return result;
};
