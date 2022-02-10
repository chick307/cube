import { KeyboardServiceImpl } from './keyboard-service';

const createKeyboardService = () => new KeyboardServiceImpl();

describe('KeyboardServiceImpl class', () => {
    describe('keyboardService.attachTo() method', () => {
        test('it returns detachable object', async () => {
            const keyboardService = createKeyboardService();
            const listener = jest.fn();
            const node = document.createElement('div');
            keyboardService.onKeyDown.addListener(listener);
            const detachable = keyboardService.attachTo(node);
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            expect(listener).not.toHaveBeenCalled();
            detachable.detach();
            node.dispatchEvent(event);
            await Promise.resolve();
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('keyboardService.onKeyDown property', () => {
        test('it is emitted when the attached node dispatch keydown events', async () => {
            const keyboardService = createKeyboardService();
            const listener = jest.fn();
            const node = document.createElement('div');
            keyboardService.onKeyDown.addListener(listener);
            keyboardService.attachTo(node);
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            expect(listener).not.toHaveBeenCalled();
            node.dispatchEvent(event);
            await Promise.resolve();
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith({ key: 'ArrowDown' });
        });
    });
});
