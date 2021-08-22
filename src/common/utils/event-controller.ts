export type EventListener<Event> = (event: Event) => void;

export type EventSignalLike<Event> = {
    addListener(listener: EventListener<Event>): {
        removeListener(): void;
    };
};

export class EventSignal<Event> implements EventSignalLike<Event> {
    constructor(private _signal: EventSignalLike<Event>) {}

    static never<Event>(): EventSignal<Event> {
        return new EventSignal({
            addListener: () => {
                return {
                    removeListener: () => undefined,
                };
            },
        });
    }

    addListener(listener: EventListener<Event>): {
        removeListener(): void;
    } {
        return this._signal.addListener(listener);
    }
}

class EventSignalInternal<Event> implements EventSignalLike<Event> {
    idCounter = 0;

    listeners = [] as {
        id: number;
        listener: EventListener<Event>;
    }[];

    addListener(listener: EventListener<Event>): {
        removeListener(): void;
    } {
        const id = ++this.idCounter;
        this.listeners.push({ id, listener });
        return {
            removeListener: () => {
                const index = this.listeners.findIndex((item) => item.id === id);
                if (index !== -1)
                    this.listeners.splice(index, 1);
            },
        };
    }

    emit(event: Event) {
        Promise.resolve().then(() => {
            for (const listener of this.listeners.map(({ listener }) => listener))
                listener(event);
        });
    }
}

export class EventController<Event> {
    private _internal: EventSignalInternal<Event>;

    readonly signal: EventSignal<Event>;

    constructor() {
        this._internal = new EventSignalInternal();
        this.signal = new EventSignal(this._internal);
    }

    emit(event: Event): void {
        this._internal.emit(event);
    }
}
