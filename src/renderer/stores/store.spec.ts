import { CloseController } from '../../common/utils/close-controller';
import { immediate } from '../../common/utils/immediate';
import { Store } from './store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TestStore extends Store<any> {
    // eslint-disable--next-line @typescript-eslint/no-explicit-any
    setState(state: any) {
        super.setState(state);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateState(updater: (state: any) => any) {
        super.updateState(updater);
    }
}

describe('Store class', () => {
    describe('store.setState() method', () => {
        test('it updates store.state', async () => {
            const store = new TestStore({ abc: 123 });
            expect(store.state).toEqual({ abc: 123 });
            store.setState({ bcd: 234 });
            await immediate();
            expect(store.state).toEqual({ bcd: 234 });
            store.setState({ cde: 345 });
            await immediate();
            expect(store.state).toEqual({ cde: 345 });
        });
    });

    describe('store.updateState() method', () => {
        test('it updates store.state', async () => {
            const store = new TestStore({ abc: 123 });
            expect(store.state).toEqual({ abc: 123 });
            store.updateState(({ abc }) => ({ def: abc + 111 }));
            await immediate();
            expect(store.state).toEqual({ def: 234 });
            store.updateState(({ def }) => ({ ghi: def + 222 }));
            await immediate();
            expect(store.state).toEqual({ ghi: 456 });
        });
    });

    describe('store.subscribe()', () => {
        test('it subscribes state changes', async () => {
            const store = new TestStore({ a: 1 });
            const next = jest.fn();
            store.subscribe({ next });
            expect(next).not.toHaveBeenCalled();
            store.setState({ b: 2 });
            await immediate();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith({ b: 2 });
            next.mockClear();
            store.setState({ c: 3 });
            store.updateState(({ c }) => ({ d: c + 1 }));
            await immediate();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith({ d: 4 });
        });

        test('it returns the subscription, which has the method to unsubscribe', async () => {
            const store = new TestStore({ a: 1 });
            const next = jest.fn();
            const subscription = store.subscribe({ next });
            expect(next).not.toHaveBeenCalled();
            store.setState({ b: 2 });
            await immediate();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith({ b: 2 });
            next.mockClear();
            subscription.unsubscribe();
            store.setState({ c: 3 });
            await immediate();
            expect(next).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        test('it unsubscribes when the passed signal closed', async () => {
            const store = new TestStore({ a: 1 });
            const next = jest.fn();
            const closeController = new CloseController();
            const subscription = store.subscribe({ next }, { signal: closeController.signal });
            expect(next).not.toHaveBeenCalled();
            store.setState({ b: 2 });
            await immediate();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith({ b: 2 });
            next.mockClear();
            closeController.close();
            store.setState({ c: 3 });
            await immediate();
            expect(next).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });
    });
});
