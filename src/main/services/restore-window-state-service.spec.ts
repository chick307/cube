import type { BrowserWindow } from 'electron';
import type { PersistenceService } from './persistence-service';
import type { RestoreWindowStateService } from './restore-window-state-service';
import { RestoreWindowStateServiceImpl } from './restore-window-state-service';

const notImplemented = () => {
    throw Error('Not implemented');
};

const dummyPersistenceService: PersistenceService = {
    get: notImplemented,
    set: notImplemented,
};

const dummyWindow = {
    getBounds: notImplemented,
    on: () => {},
} as any as BrowserWindow;

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('RestoreWindowStateService type', () => {
    describe('restoreWindowStateService.getWindowOptions() method', () => {
        test('it returns window options built from saved window state', () => {
            const get = jest.spyOn(dummyPersistenceService, 'get');
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            get.mockImplementation((key: any) => {
                if (key === 'windowState')
                    return { x: 10, y: 20, width: 300, height: 400 };
                return notImplemented();
            });
            const result = restoreWindowStateService.getWindowOptions();
            expect(result).toEqual({ x: 10, y: 20, width: 300, height: 400 });
        });

        test('it returns default window options if the window state is not saved', () => {
            const get = jest.spyOn(dummyPersistenceService, 'get');
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            get.mockImplementation((key: any) => {
                if (key === 'windowState')
                    return undefined;
                return notImplemented();
            });
            const result = restoreWindowStateService.getWindowOptions();
            expect(result).toEqual({ x: undefined, y: undefined, width: 800, height: 640 });
        });
    });

    describe('restoreWindowStateService.observeWindow() method', () => {
        test('it observes the close event of the window', () => {
            const getBounds = jest.spyOn(dummyWindow, 'getBounds');
            getBounds.mockReturnValue({ x: 10, y: 20, width: 300, height: 400 });
            const on = jest.spyOn(dummyWindow, 'on');
            const set = jest.spyOn(dummyPersistenceService, 'set');
            set.mockReturnValue(undefined);
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            restoreWindowStateService.observeWindow(dummyWindow);
            expect(on).toHaveBeenCalledWith('close', expect.any(Function));
        });

        test.each([
            ['move'],
            ['resize'],
        ])('it observes the %s event of the window', (eventName) => {
            const getBounds = jest.spyOn(dummyWindow, 'getBounds');
            getBounds.mockReturnValue({ x: 10, y: 20, width: 300, height: 400 });
            const on = jest.spyOn(dummyWindow, 'on');
            const set = jest.spyOn(dummyPersistenceService, 'set');
            set.mockReturnValue(undefined);
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            restoreWindowStateService.observeWindow(dummyWindow);
            expect(on).toHaveBeenCalledWith(eventName, expect.any(Function));
        });

        test('it saves the window state after 1 sec from the last when fired resize or move events', () => {
            const getBounds = jest.spyOn(dummyWindow, 'getBounds');
            getBounds.mockReturnValue({ x: 10, y: 20, width: 300, height: 400 });
            const on = jest.spyOn(dummyWindow, 'on');
            const set = jest.spyOn(dummyPersistenceService, 'set');
            set.mockReturnValue(undefined);
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            restoreWindowStateService.observeWindow(dummyWindow);
            const [move, resize] = ['move', 'resize']
                .map((eventName) => {
                    return on.mock.calls
                        .filter((call: any[]) => call[0] === eventName)
                        .map((call: any[]) => call[1] as (() => void));
                })
                .map((listeners) => () => {
                    for (const listener of listeners)
                        listener();
                });
            expect(set).not.toHaveBeenCalled();
            move();
            jest.advanceTimersByTime(500);
            resize();
            jest.advanceTimersByTime(500);
            move();
            jest.advanceTimersByTime(500);
            expect(set).not.toHaveBeenCalled();
            jest.advanceTimersByTime(500);
            expect(set).toHaveBeenCalledTimes(1);
            expect(set).toHaveBeenCalledWith('windowState', { x: 10, y: 20, width: 300, height: 400 });
            set.mockClear();
            expect(jest.getTimerCount()).toBe(0);
            resize();
            jest.advanceTimersByTime(1000);
            expect(set).toHaveBeenCalledTimes(1);
            expect(set).toHaveBeenCalledWith('windowState', { x: 10, y: 20, width: 300, height: 400 });
            expect(jest.getTimerCount()).toBe(0);
        });

        test('it saves the window state when fired close events', () => {
            const getBounds = jest.spyOn(dummyWindow, 'getBounds');
            getBounds.mockReturnValue({ x: 10, y: 20, width: 300, height: 400 });
            const on = jest.spyOn(dummyWindow, 'on');
            const set = jest.spyOn(dummyPersistenceService, 'set');
            set.mockReturnValue(undefined);
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            restoreWindowStateService.observeWindow(dummyWindow);
            const [close] = ['close']
                .map((eventName) => {
                    return on.mock.calls
                        .filter((call: any[]) => call[0] === eventName)
                        .map((call: any[]) => call[1] as (() => void));
                })
                .map((listeners) => () => {
                    for (const listener of listeners)
                        listener();
                });
            expect(set).not.toHaveBeenCalled();
            close();
            expect(set).toHaveBeenCalledTimes(1);
            expect(set).toHaveBeenCalledWith('windowState', { x: 10, y: 20, width: 300, height: 400 });
        });

        test('it saves the window state when fired close events even after move events or resize events', () => {
            const getBounds = jest.spyOn(dummyWindow, 'getBounds');
            getBounds.mockReturnValue({ x: 10, y: 20, width: 300, height: 400 });
            const on = jest.spyOn(dummyWindow, 'on');
            const set = jest.spyOn(dummyPersistenceService, 'set');
            set.mockReturnValue(undefined);
            const restoreWindowStateService: RestoreWindowStateService = new RestoreWindowStateServiceImpl({
                persistenceService: dummyPersistenceService,
            });
            restoreWindowStateService.observeWindow(dummyWindow);
            const [move, resize, close] = ['move', 'resize', 'close']
                .map((eventName) => {
                    return on.mock.calls
                        .filter((call: any[]) => call[0] === eventName)
                        .map((call: any[]) => call[1] as (() => void));
                })
                .map((listeners) => () => {
                    for (const listener of listeners)
                        listener();
                });
            expect(set).not.toHaveBeenCalled();
            resize();
            jest.advanceTimersByTime(400);
            move();
            jest.advanceTimersByTime(400);
            resize();
            jest.advanceTimersByTime(400);
            expect(set).not.toHaveBeenCalled();
            close();
            expect(set).toHaveBeenCalledTimes(1);
            expect(set).toHaveBeenCalledWith('windowState', { x: 10, y: 20, width: 300, height: 400 });
            expect(jest.getTimerCount()).toBe(0);
        });
    });
});
