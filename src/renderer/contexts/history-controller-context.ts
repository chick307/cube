import React from 'react';

import type { HistoryController } from '../controllers/history-controller';

const Context = React.createContext<HistoryController | null>(null);

export const HistoryControllerProvider = Context.Provider as React.Provider<HistoryController>;

export const useHistoryController = (): HistoryController => {
    const historyController = React.useContext(Context);
    if (historyController === null)
        throw Error();
    return historyController;
};
