import React from 'react';

import { Store } from '../stores/store';

export const useStore = <State>(store: Store<State>) => {
    const [state, setState] = React.useState(() => store.state);

    React.useEffect(() => {
        const subscription = store.subscribe({
            next: (nextState) => {
                setState(nextState);
            },
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [store]);

    return state;
};
