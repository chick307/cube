import React from 'react';

import { useKeyboardService } from '../contexts/keyboard-service-context';
import { KeyboardServiceEvent } from '../services/keyboard-service';

export { KeyboardServiceEvent };

export const useKeyDown = (
    handler: (event: KeyboardServiceEvent) => void,
    deps?: React.DependencyList | null | undefined,
) => {
    const keyboardService = useKeyboardService();

    const listener = React.useCallback(handler, deps ?? []);

    React.useEffect(() => {
        const keyDownListening = keyboardService?.onKeyDown.addListener(listener);
        return () => {
            keyDownListening?.removeListener();
        };
    }, [keyboardService, listener]);
};
