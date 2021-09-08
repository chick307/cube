import React from 'react';

import { CloseController, CloseSignal } from '../../common/utils/close-controller';

export type TaskCallback<T> = (signal: CloseSignal) => Promise<T>;

export const useTask = <T>(f: TaskCallback<T>, deps?: React.DependencyList) => {
    const generationRef = React.useRef(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = React.useState<[T] | [undefined, any] | []>(() => []);

    const generation = React.useMemo(() => generationRef.current + 1 | 0, deps);

    React.useEffect(() => {
        const closeController = new CloseController();

        f(closeController.signal).then((r) => {
            if (!closeController.signal.closed) {
                generationRef.current = generation;
                setResult([r]);
                closeController.close();
            }
        }, (e) => {
            if (!closeController.signal.closed) {
                generationRef.current = generation;
                setResult([undefined, e]);
                closeController.close();
            }
        });

        return () => {
            closeController.close();
        };
    }, deps);

    if (generationRef.current !== generation)
        return [];

    return result;
};
