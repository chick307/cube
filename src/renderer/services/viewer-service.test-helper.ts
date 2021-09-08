import { ViewerService } from './viewer-service';

export const createViewerService = () => {
    const viewerService: ViewerService = {
        prioritizeViewers: () => Promise.resolve([]),
        selectViewer: () => null,
    };

    return {
        viewerService,
    };
};
