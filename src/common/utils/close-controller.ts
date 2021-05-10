export class Closed {
    //
}

export type CloseSignalLike = {
    closed: boolean;
    defer(callback: () => void): Promise<void>;
};

export class CloseSignal {
    constructor(private _signal: CloseSignalLike) {
        //
    }

    get closed(): boolean {
        return this._signal.closed;
    }

    async defer(callback: () => void): Promise<void> {
        await this._signal.defer(callback);
    }

    throwIfClosed(): void {
        if (this._signal.closed)
            throw new Closed();
    }

    async wrapPromise<T>(promise: PromiseLike<T>): Promise<T> {
        const result = await Promise.race([promise, this._signal.defer(() => {})]);
        if (this._signal.closed)
            throw new Closed();
        return result as T;
    }
}

class CloseSignalInternal {
    close: () => void;
    closed = false;
    promise: Promise<void>;

    constructor() {
        this.close = null!;
        this.promise = new Promise((resolve) => {
            this.close = () => {
                this.closed = true;
                resolve();
            };
        });
    }

    async defer(callback: () => void): Promise<void> {
        return this.promise.then(callback);
    }
}

export class CloseController {
    private _internal: CloseSignalInternal;

    readonly signal: CloseSignal;

    constructor() {
        this._internal = new CloseSignalInternal();
        this.signal = new CloseSignal(this._internal);
    }

    close(): void {
        if (!this._internal.closed)
            this._internal.close();
    }
}
