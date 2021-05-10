import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { immediate } from '../../common/utils/immediate';
import { Store } from '../stores/store';
import { useStore } from './use-store';

class TestStore extends Store<any> {
    setState(state: any): void {
        super.setState(state);
    }
}

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

describe('useStore() hook', () => {
    test('it returns the state of the store', async () => {
        let state: any = null;
        const store = new TestStore({ a: 1 });
        const Component = () => {
            state = useStore(store);
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render(<Component />, container);
        });
        expect(state).toEqual({ a: 1 });
        await TestUtils.act(async () => {
            store.setState({ b: 2 });
            await immediate();
        });
        expect(state).toEqual({ b: 2 });
        TestUtils.act(() => {
            ReactDom.unmountComponentAtNode(container);
        });
    });
});
