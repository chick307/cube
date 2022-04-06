import { Restate } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { MarkdownViewerController, MarkdownViewerControllerState } from './markdown-viewer-controller';

export const createMarkdownViewerController = () => {
    const markdownViewerControllerRestate = new Restate<MarkdownViewerControllerState>({
        scrollPosition: Point.zero,
        tree: null,
    });

    const markdownViewerController: MarkdownViewerController = {
        state: markdownViewerControllerRestate.state,
        initialize: () => {},
        isExternalLink: (href: string | null | undefined) =>
            href != null && new URL(href, 'file:///').protocol !== 'file:',
        loadImage: async () => null,
        openLink: () => {},
        scrollTo: () => {},
    };

    return {
        markdownViewerController,
        markdownViewerControllerRestate,
    };
};
