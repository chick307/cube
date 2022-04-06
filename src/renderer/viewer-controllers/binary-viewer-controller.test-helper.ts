import { Restate } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { BinaryViewerController, BinaryViewerControllerState } from './binary-viewer-controller';

export const createBinaryViewerController = () => {
    const binaryViewerControllerRestate = new Restate<BinaryViewerControllerState>({
        blocks: null,
        buffer: null,
        scrollPosition: Point.zero,
    });

    const binaryViewerController: BinaryViewerController = {
        state: binaryViewerControllerRestate.state,
        initialize: () => {},
        scrollTo: () => {},
    };

    return {
        binaryViewerController,
        binaryViewerControllerRestate,
    };
};
