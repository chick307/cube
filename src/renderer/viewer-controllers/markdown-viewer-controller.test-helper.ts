import { Restate } from '../../common/utils/restate';
import { MarkdownViewerController, MarkdownViewerControllerState } from './markdown-viewer-controller';

export const createMarkdownViewerController = () => {
    const markdownViewerControllerRestate = new Restate<MarkdownViewerControllerState>({
        tree: null,
    });

    const markdownViewerController: MarkdownViewerController = {
        state: markdownViewerControllerRestate.state,
        initialize: () => {},
        loadImage: async () => null,
        openLink: () => {},
    };

    return {
        markdownViewerController,
        markdownViewerControllerRestate,
    };
};
