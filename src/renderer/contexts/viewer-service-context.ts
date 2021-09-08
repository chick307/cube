import React from 'react';

import type { ViewerService } from '../services/viewer-service';

const Context = React.createContext<ViewerService | null>(null);

export const ViewerServiceProvider = Context.Provider as React.Provider<ViewerService>;

export const useViewerService = (): ViewerService => {
    const viewerService = React.useContext(Context);
    if (viewerService === null)
        throw Error();
    return viewerService;
};
