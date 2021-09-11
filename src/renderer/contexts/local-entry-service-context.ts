import React from 'react';

import type { LocalEntryService } from '../services/local-entry-service';

const Context = React.createContext<LocalEntryService | null>(null);

export const LocalEntryServiceProvider = Context.Provider as React.Provider<LocalEntryService>;

export const useLocalEntryService = (): LocalEntryService => {
    const localEntrySevice = React.useContext(Context);
    if (localEntrySevice === null)
        throw Error();
    return localEntrySevice;
};
