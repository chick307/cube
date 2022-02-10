import { EventController } from '../../common/utils/event-controller';
import { KeyboardService, KeyboardServiceEvent } from './keyboard-service';

export const createKeyboardService = (): {
    keyDownEventController: EventController<KeyboardServiceEvent>;
    keyboardService: KeyboardService;
} => {
    const keyDownEventController = new EventController<KeyboardServiceEvent>();

    const keyboardService: KeyboardService = {
        onKeyDown: keyDownEventController.signal,
    };

    return {
        keyDownEventController,
        keyboardService,
    };
};
