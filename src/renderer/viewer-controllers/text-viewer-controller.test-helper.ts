import { Restate } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { TextViewerController, TextViewerControllerState } from './text-viewer-controller';

export const createTextViewerController = () => {
    const textViewerControllerRestate = new Restate<TextViewerControllerState>({
        scrollPosition: new Point(0, 0),
        lines: null,
    });

    const textViewerController: TextViewerController = {
        state: textViewerControllerRestate.state,
        initialize: () => {},
        scrollTo: () => {},
    };

    return {
        textViewerController,
        textViewerControllerRestate,
    };
};
