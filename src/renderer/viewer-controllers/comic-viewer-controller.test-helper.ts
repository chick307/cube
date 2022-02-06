import { Restate } from '../../common/utils/restate';
import { ComicViewerController, ComicViewerControllerState } from './comic-viewer-controller';

export const createComicViewerController = () => {
    const comicViewerControllerRestate = new Restate<ComicViewerControllerState>({
        currentSpread: null,
        pageDisplay: 'two',
        spreads: [],
    });

    const comicViewerController: ComicViewerController = {
        state: comicViewerControllerRestate.state,
        initialize: () => {},
        openFirstPage: () => {},
        openNextPage: () => {},
        openLastPage: () => {},
        openLeftPage: () => {},
        openPreviousPage: () => {},
        openRightPage: () => {},
        setPageDisplay: () => {},
    };

    return {
        comicViewerController,
        comicViewerControllerRestate,
    };
};
