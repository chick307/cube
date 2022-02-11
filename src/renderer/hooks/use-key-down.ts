import React from 'react';

import { KeyboardService, KeyboardServiceEvent } from '../services/keyboard-service';
import { useService } from './use-service';

export { KeyboardServiceEvent };

export const useKeyDown = (
    handler: (event: KeyboardServiceEvent) => void,
    deps?: React.DependencyList | null | undefined,
) => {
    const keyboardService = useService('keyboardService');

    const listener = React.useCallback(handler, deps ?? []);

    React.useEffect(() => {
        const keyDownListening = keyboardService?.onKeyDown.addListener(listener);
        return () => {
            keyDownListening?.removeListener();
        };
    }, [keyboardService, listener]);
};

declare module './use-service' {
    interface Services {
        'hooks/use-key-down': {
            keyboardService: KeyboardService | null;
        };
    }
}
