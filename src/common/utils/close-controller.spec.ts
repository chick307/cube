import { CloseController, Closed } from './close-controller';

describe('CloseController class', () => {
    describe('closeController.close() method', () => {
        test('it calls the deferred functions', async () => {
            const callbacks = Array.from(new Array(3), () => jest.fn());
            const closeController = new CloseController();
            for (const callback of callbacks)
                closeController.signal.defer(callback);
            for (const callback of callbacks)
                expect(callback).not.toHaveBeenCalled();
            closeController.close();
            await Promise.resolve();
            for (const callback of callbacks)
                expect(callback).toHaveBeenCalledTimes(1);
        });

        test('it does nothing if already closed', async () => {
            const callback = jest.fn();
            const closeController = new CloseController();
            closeController.signal.defer(callback);
            expect(callback).not.toHaveBeenCalled();
            closeController.close();
            await Promise.resolve();
            expect(callback).toHaveBeenCalledTimes(1);
            callback.mockClear();
            for (const _ of new Array(3).fill(null)) {
                closeController.close();
                await Promise.resolve();
                expect(callback).not.toHaveBeenCalled();
            }
        });
    });

    describe('closeController.signal.defer() method', () => {
        test('it returns a rejected promise when the callback has been thrown any error', async () => {
            const error = Error();
            const callback = jest.fn(() => {
                throw error;
            });
            const closeController = new CloseController();
            const promise = closeController.signal.defer(callback);
            closeController.close();
            await expect(promise).rejects.toBe(error);
        });
    });

    describe('closeController.signal.wrapPromise() method', () => {
        test('it returns resolved promise if the passed promise is resolved before closing', async () => {
            const closeController = new CloseController();
            const promise = closeController.signal.wrapPromise(Promise.resolve(123));
            await expect(promise).resolves.toBe(123);
            closeController.close();
        });

        test('it returns rejected promise if the passed promise is not resolved before closing', async () => {
            const closeController = new CloseController();
            let resolve = () => {};
            const promise = closeController.signal.wrapPromise(new Promise<void>((r) => {
                resolve = r;
            }));
            closeController.close();
            await expect(promise).rejects.toBeInstanceOf(Closed);
            resolve();
        });
    });
});
