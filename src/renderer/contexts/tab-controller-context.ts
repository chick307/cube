import React from 'react';

import type { TabController } from '../controllers/tab-controller';

const Context = React.createContext<TabController | null>(null);

export const TabControllerProvider = Context.Provider as React.Provider<TabController>;

export const useTabController = (): TabController => {
    const tabController = React.useContext(Context);
    if (tabController === null)
        throw Error();
    return tabController;
};
