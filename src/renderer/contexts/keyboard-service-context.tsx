import React from 'react';

import type { KeyboardService } from '../services/keyboard-service';

const Context = React.createContext<KeyboardService | null>(null);

export const KeyboardServiceProvider = Context.Provider as React.Provider<KeyboardService | null>;

export const useKeyboardService = (): KeyboardService | null => {
    const keyboardService = React.useContext(Context);
    return keyboardService;
};
