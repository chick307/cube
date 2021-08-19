import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { immediate } from '../../common/utils/immediate';
import { Restate, State } from '../../common/utils/restate';
import { useRestate } from './use-restate';

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

describe('useRestate() hook', () => {
    test('returns current state for each generations', async () => {
        const restate = new Restate(1);
        const constantState = State.of('abc');
        const spy = jest.fn();
        const Component = () => {
            const counter = useRestate(restate.state);
            const text = useRestate(constantState);
            spy([counter, text]);
            return <></>;
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith([1, 'abc']);
        spy.mockClear();
        await TestUtils.act(async () => {
            await restate.set(2);
            await immediate();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith([2, 'abc']);
        spy.mockClear();
        await TestUtils.act(async () => {
            await restate.set(3);
            await immediate();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith([3, 'abc']);
        spy.mockClear();
        await TestUtils.act(async () => {
            ReactDom.unmountComponentAtNode(container);
            await immediate();
        });
    });

    test('returns current state for each generations even when microtask', async () => {
        const restate = new Restate(0);
        const constantState = State.of('abc');
        const spy = jest.fn();
        const Component = () => {
            const counter = useRestate(restate.state);
            const text = useRestate(constantState);
            spy([counter, text]);
            return <></>;
        };
        restate.set(1);
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenNthCalledWith(1, [0, 'abc']);
        expect(spy).toHaveBeenNthCalledWith(2, [1, 'abc']);
    });
});
