import { CloseSignal } from '../../common/utils/close-controller';

export type Observer<State> = {
    next: (state: State) => void;
};

export type SubscribeOptions = {
    signal?: CloseSignal;
};

export class Store<State> {
    private _observers: Observer<State>[] = [];

    private _state: State;

    private _updating = Promise.resolve();

    constructor(initialState: State) {
        this._state = initialState;
    }

    protected setState(state: State) {
        this.updateState(() => state);
    }

    protected updateState(updater: (state: State) => State): void {
        const updating = this._updating = this._updating
            .then(() => {
                this._state = updater(this._state);
                if (updating !== this._updating)
                    return;
                for (const observer of this._observers)
                    observer.next(this._state);
            });
    }

    get state() {
        return this._state;
    }

    subscribe(observer: Observer<State>, options?: SubscribeOptions) {
        this._observers.push(observer);

        const unsubscribe = () => {
            const index = this._observers.indexOf(observer);
            if (index !== -1)
                this._observers.splice(index, 1);
        };

        options?.signal?.defer(unsubscribe);

        return { unsubscribe };
    }
}
