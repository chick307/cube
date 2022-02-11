import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { composeElements } from '../utils/compose-elements';
import { ServiceProvider, ServicesProvider, useService } from './use-service';

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

describe('useService() hook', () => {
    test('it returns the service', () => {
        const services = { testService: 'ABC' };
        const Component = () => {
            const value = useService('testService');
            return <div>{value}</div>;
        };
        TestUtils.act(() => {
            ReactDom.render(composeElements(
                <ServicesProvider value={services}/>,
                <Component />,
            ), container);
        });
        expect(container.textContent).toBe('ABC');
        TestUtils.act(() => {
            ReactDom.render(composeElements(
                <ServicesProvider value={services} />,
                <ServiceProvider name="testService" value="TEST" />,
                <Component />,
            ), container);
        });
        expect(container.textContent).toBe('TEST');
    });

    test('it throws an error if no service is provided', () => {
        let called = false;
        const Component = () => {
            expect(() => {
                useService('testService');
            }).toThrow();
            called = true;
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render((
                <Component />
            ), container);
        });
        expect(called).toBe(true);
    });

    test('it throws an error if the specified service is not provided', () => {
        const services = {};
        let called = false;
        const Component = () => {
            expect(() => {
                useService('testService');
            }).toThrow();
            called = true;
            return <></>;
        };
        TestUtils.act(() => {
            ReactDom.render(composeElements(
                <ServicesProvider value={services} />,
                <Component />,
            ), container);
        });
        expect(called).toBe(true);
    });
});

declare module './use-service' {
    interface Services {
        'hooks/use-service.spec': {
            testService: any;
        };
    }
}
