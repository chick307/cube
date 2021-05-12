import React from 'react';

import type { EntryService } from '../services/entry-service';

const Context = React.createContext<EntryService | null>(null);

export const EntryServiceProvider = Context.Provider as React.Provider<EntryService>;

export const useEntryService = (): EntryService => {
    const entryService = React.useContext(Context);
    if (entryService === null)
        throw Error();
    return entryService;
};
