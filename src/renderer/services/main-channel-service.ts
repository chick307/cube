import { EventSignal } from '../../common/utils/event-controller';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MainChannelIncomingMessages {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MainChannelOutgoingMessages {}

export type MainChannelIncomingMessage = MainChannelIncomingMessages[keyof MainChannelIncomingMessages];

export type MainChannelOutgoingMessage = MainChannelOutgoingMessages[keyof MainChannelOutgoingMessages];

export type MainChannelService = {
    onMessage: EventSignal<MainChannelIncomingMessage>;

    postMessage(message: MainChannelOutgoingMessage): void;
};

export class MainChannelServiceImpl implements MainChannelService {
    #messageEventSignal: EventSignal<MainChannelIncomingMessage>;

    #messagePort: MessagePort;

    constructor(params: {
        messagePort: MessagePort;
    }) {
        this.#messagePort = params.messagePort;
        this.#messageEventSignal = EventSignal.fromMessagePort<MainChannelIncomingMessage>(this.#messagePort);
    }

    get onMessage(): EventSignal<MainChannelIncomingMessage> {
        return this.#messageEventSignal;
    }

    postMessage(message: MainChannelOutgoingMessage): void {
        this.#messagePort.postMessage(message);
    }
}
