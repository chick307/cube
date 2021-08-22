import { EventController, EventSignal } from './event-controller';

describe('EventController class', () => {
    describe('eventController.emit() method', () => {
        test('it calls added listeners', async () => {
            const eventController = new EventController();
            const listeners = Array.from(new Array(3), () => jest.fn());
            for (const listener of listeners)
                eventController.signal.addListener(listener);
            const event = { a: 123 };
            eventController.emit(event);
            await Promise.resolve();
            for (const listener of listeners) {
                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(event);
            }
            for (const listener of listeners)
                listener.mockClear();
            eventController.emit(event);
            await Promise.resolve();
            for (const listener of listeners) {
                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(event);
            }
        });
    });

    describe('eventController.signal.addListener() method', () => {
        test('it returns an object to remove the listener', async () => {
            const eventController = new EventController();
            const listener = jest.fn();
            const listening = eventController.signal.addListener(listener);
            const event = { a: 123 };
            eventController.emit(event);
            await Promise.resolve();
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(event);
            listener.mockClear();
            listening.removeListener();
            eventController.emit(event);
            await Promise.resolve();
            expect(listener).toHaveBeenCalledTimes(0);
            listener.mockClear();
            listening.removeListener();
            eventController.emit(event);
            await Promise.resolve();
            expect(listener).toHaveBeenCalledTimes(0);
        });
    });
});

describe('EventSignal class', () => {
    describe('EventSignal.never() method', () => {
        test('it creates a new event signal that does nothing', () => {
            const signal = EventSignal.never();
            expect(signal).toBeInstanceOf(EventSignal);
            signal.addListener(() => {}).removeListener();
        });
    });
});
