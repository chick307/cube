import React from 'react';

import { CloseController, CloseSignal } from '../../common/utils/close-controller';

export type TaskCallback<T> = (signal: CloseSignal) => Promise<T>;

export const useTask = <T>(f: TaskCallback<T>, deps?: React.DependencyList) => {
    const [result, setResult] = React.useState<[T] | [undefined, any] | []>(() => []);

    React.useEffect(() => {
        const closeController = new CloseController();

        f(closeController.signal).then((r) => {
            setResult([r]);
        }, (e) => {
            setResult([undefined, e]);
        });

        return () => {
            closeController.close();
        };
    }, deps);

    return result;
};
