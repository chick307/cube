import { Restate } from '../../common/utils/restate';
import { Point } from '../../common/values/point';
import { TextViewerController, TextViewerControllerState } from './text-viewer-controller';

export const createTextViewerController = () => {
    const textViewerControllerRestate = new Restate<TextViewerControllerState>({
        language: 'plaintext',
        scrollPosition: Point.zero,
        lines: null,
    });

    const textViewerController: TextViewerController = {
        state: textViewerControllerRestate.state,
        initialize: () => {},
        setLanguage: () => {},
        scrollTo: () => {},
    };

    return {
        textViewerController,
        textViewerControllerRestate,
    };
};
