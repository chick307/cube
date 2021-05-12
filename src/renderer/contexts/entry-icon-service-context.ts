import React from 'react';

import type { EntryIconService } from '../services/entry-icon-service';

const Context = React.createContext<EntryIconService | null>(null);

export const EntryIconServiceProvider = Context.Provider as React.Provider<EntryIconService>;

export const useEntryIconService = (): EntryIconService => {
    const entryIconService = React.useContext(Context);
    if (entryIconService === null)
        throw Error();
    return entryIconService;
};
