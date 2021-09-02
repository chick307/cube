import React from 'react';

import type { ContextMenuService } from '../services/context-menu-service';

const Context = React.createContext<ContextMenuService | null>(null);

export const ContextMenuServiceProvider = Context.Provider as React.Provider<ContextMenuService>;

export const useContextMenuService = (): ContextMenuService => {
    const contextMenuSevice = React.useContext(Context);
    if (contextMenuSevice === null)
        throw Error();
    return contextMenuSevice;
};
