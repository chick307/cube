import React from 'react';

import { CloseController } from '../../common/utils/close-controller';
import { State } from '../../common/utils/restate';

export const useRestate = <T>(state: State<T>): T => {
    const [current, setCurrent] = React.useState(state.current);

    React.useEffect(() => {
        if (current !== state.current)
            setCurrent(state.current);
        const closeController = new CloseController();
        state.forEach((value) => {
            setCurrent(value);
        }, { signal: closeController.signal });
        return () => {
            closeController.close();
        };
    }, [state]);

    return current;
};
