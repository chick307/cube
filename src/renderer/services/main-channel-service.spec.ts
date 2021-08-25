import { MessageChannel } from 'worker_threads';

import { timeout } from '../../common/utils/immediate';
import { MainChannelServiceImpl } from './main-channel-service';

const createMessagePorts = (): [MessagePort, MessagePort] => {
    const { port1, port2 } = new MessageChannel() as any;
    return [port1, port2];
};

describe('MainChannelService type', () => {
    describe('mainChannelService.onMessage property', () => {
        test('it receives messages', async () => {
            const [port1, port2] = createMessagePorts();
            try {
                const mainChannelService = new MainChannelServiceImpl({ messagePort: port1 });
                const listener = jest.fn();
                mainChannelService.onMessage.addListener(listener);
                port2.postMessage({ type: 'window.add-tab' });
                await timeout();
                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith({ type: 'window.add-tab' });
                listener.mockClear();
            } finally {
                port2.close();
            }
        });
    });

    describe('mainChannelService.postMessage() method', () => {
        test('it sends a message', async () => {
            const [port1, port2] = createMessagePorts();
            try {
                const mainChannelService = new MainChannelServiceImpl({ messagePort: port1 });
                const messageHandler = jest.fn();
                port2.addEventListener('message', messageHandler);
                port2.start();
                mainChannelService.postMessage({ type: 'window.ready-to-show' });
                await timeout();
                expect(messageHandler).toHaveBeenCalledTimes(1);
                expect(messageHandler.mock.calls[0][0].data).toEqual({ type: 'window.ready-to-show' });
                messageHandler.mockClear();
            } finally {
                port2.close();
            }
        });
    });
});
