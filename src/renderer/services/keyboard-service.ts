import { EventController, EventSignal } from "../../common/utils/event-controller";

export type KeyboardService = {
    onKeyDown: EventSignal<KeyboardServiceEvent>;
};

export type KeyboardServiceEvent = {
    key: string;
};

export class KeyboardServiceImpl implements KeyboardService {
    #keyDownEventController: EventController<KeyboardServiceEvent>;

    constructor() {
        this.#keyDownEventController = new EventController<KeyboardServiceEvent>();
    }

    get onKeyDown(): EventSignal<KeyboardServiceEvent> {
        return this.#keyDownEventController.signal;
    }

    attachTo(node: Node): {
        detach: () => void;
    } {
        const keyDownHandler = (event: KeyboardEvent) => {
            const { key } = event;
            this.#keyDownEventController.emit({ key });
        };
        node.addEventListener('keydown', keyDownHandler as EventListener, {});
        return {
            detach: () => {
                node.removeEventListener('keydown', keyDownHandler as EventListener);
            },
        };
    }
}
