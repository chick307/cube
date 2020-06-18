export type Observer<State> = {
    next: (state: State) => void;
};

export class Store<State> {
    private _observers: Observer<State>[] = [];
    private _state: State;

    constructor(initialState: State) {
        this._state = initialState;
    }

    get state() {
        return this._state;
    }

    protected setState(state: State) {
        this._state = state;

        for (const observer of this._observers)
            observer.next(state);
    }

    subscribe(observer: Observer<State>) {
        this._observers.push(observer);

        return {
            unsubscribe: () => {
                const index = this._observers.indexOf(observer);
                if (index !== -1)
                    this._observers.splice(index, 1);
            }
        };
    }
}
