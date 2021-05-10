import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { CloseSignal } from '../../common/utils/close-controller';
import { immediate } from '../../common/utils/immediate';
import { useTask } from './use-task';

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;
});

describe('useTask() hook', () => {
    test('it calls the passed callback function with a close signal', async () => {
        let result: any;
        const callback = jest.fn(async (signal) => {
            expect(signal).toBeInstanceOf(CloseSignal);
            return { a: 123 };
        });
        const Component = () => {
            result = useTask(callback, []);
            return <></>;
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(result).toEqual([{ a: 123 }]);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('it returns the error if the passed callback function thrown', async () => {
        let result: any;
        const callback = jest.fn(async () => {
            throw Error('ERROR');
        });
        const Component = () => {
            result = useTask(callback, []);
            return <></>;
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(result).toEqual([undefined, Error('ERROR')]);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('it closes if the deps are changed', async () => {
        const closed = jest.fn();
        const callback = jest.fn(async (signal) => {
            signal.defer(closed);
        });
        const Component = (props: { deps: any[]; }) => {
            useTask(callback, props.deps);
            return <></>;
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component deps={[1]} />, container);
            await immediate();
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(closed).not.toHaveBeenCalled();
        callback.mockClear();
        await TestUtils.act(async () => {
            ReactDom.render(<Component deps={[2]} />, container);
            await immediate();
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(closed).toHaveBeenCalledTimes(1);
    });
});
