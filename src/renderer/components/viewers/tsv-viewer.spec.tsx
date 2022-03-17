import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { createEntryMap } from '../../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../../common/entities/file-system.test-helper';
import { immediate } from '../../../common/utils/immediate';
import { Restate } from '../../../common/utils/restate';
import { TsvViewerState } from '../../../common/values/viewer-state';
import type { TsvViewerControllerFactory } from '../../factories/viewer-controller-factory';
import { ServicesProvider } from '../../hooks/use-service';
import { composeElements } from '../../utils/compose-elements';
import type {
    TsvViewerController,
    TsvViewerControllerState,
} from '../../viewer-controllers/tsv-viewer-controller';
import { TsvViewer } from './tsv-viewer';
import styles from './tsv-viewer.module.css';

const entries = createEntryMap([
    '/a.tsv',
]);

const fileSystem = new DummyFileSystem();

let services: {
    $viewerController: TsvViewerController;

    viewerControllerFactory: TsvViewerControllerFactory;
};

let controller: {
    updateValues(values: string[][]): Promise<void>;
};

let container: HTMLElement;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const viewerControllerFactory: TsvViewerControllerFactory = {
        createTsvViewerController: () => $viewerController,
    };

    const defaultState = {
        header: { cells: [], id: 'header' },
        rows: [],
    };

    const restate = new Restate<TsvViewerControllerState>({ ...defaultState });

    const $viewerController: TsvViewerController = {
        state: restate.state,
        initialize: () => {},
    };

    controller = {
        updateValues: (values: string[][]) => restate.update((state) => {
            const rows = values.map((cellValues, index) => {
                const cells = cellValues.map((value, i) => {
                    return { id: `c${index}x${i}`, value };
                });
                return { cells, id: `r${index}` };
            });
            const header = rows.shift() ?? defaultState.header;
            return {
                ...state,
                header,
                rows,
            };
        }),
    };

    services = {
        $viewerController,
        viewerControllerFactory,
    };
});

afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
    container = null!;

    services = null!;
    controller = null!;
});

describe('TsvViewer component', () => {
    test('it displays the TSV', async () => {
        const initialize = jest.spyOn(services.$viewerController, 'initialize');
        const entry = entries.get('/a.tsv')!;
        const viewerState = new TsvViewerState();
        const Component = () => {
            return composeElements(
                <ServicesProvider value={services} />,
                <TsvViewer {...{ entry, fileSystem, viewerState }} />,
            );
        };
        await TestUtils.act(async () => {
            ReactDom.render(<Component />, container);
            await immediate();
        });
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenCalledWith({ entry, fileSystem, viewerState });
        expect(container.getElementsByClassName(styles.tsvViewer).length).toBe(1);
        expect(container.getElementsByClassName(styles.tsvTable).length).toBe(1);
        await TestUtils.act(async () => {
            await controller.updateValues([
                ['header'],
                ['value1'],
                ['value2'],
                ['value3'],
            ]);
        });
        expect(container.getElementsByClassName(styles.tsvViewer).length).toBe(1);
        expect(container.getElementsByClassName(styles.tsvTable).length).toBe(1);
        const tsvTable = container.getElementsByClassName(styles.tsvTable)[0];
        expect(tsvTable.getElementsByTagName('td').length).toBe((1 + 1) * 3);
    });

    describe('className property', () => {
        test('it sets a class name to the TSV viewer', async () => {
            const entry = entries.get('/a.tsv')!;
            const viewerState = new TsvViewerState();
            const Component = () => {
                return composeElements(
                    <ServicesProvider value={services} />,
                    <TsvViewer {...{ entry, fileSystem, viewerState }} className={'test-class'} />,
                );
            };
            await TestUtils.act(async () => {
                ReactDom.render(<Component />, container);
                await immediate();
            });
            const tsvViewer = container.getElementsByClassName(styles.tsvViewer)[0];
            expect(tsvViewer.classList.contains('test-class')).toBe(true);
        });
    });
});
