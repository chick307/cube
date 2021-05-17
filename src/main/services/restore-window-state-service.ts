import type { BrowserWindow } from 'electron';

import type { PersistenceService } from './persistence-service';

const RESIZE_DEBOUNCE = 1000;

type PersistentData = {
    windowState?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
};

export type WindowOptions = {
    x?: number;
    y?: number;
    width: number;
    height: number;
};

export type RestoreWindowStateService = {
    getWindowOptions(): WindowOptions;
    observeWindow(window: BrowserWindow): void;
};

export class RestoreWindowStateServiceImpl implements RestoreWindowStateService {
    private _persistenceService: PersistenceService<PersistentData>;

    constructor(container: {
        persistenceService: PersistenceService<PersistentData>;
    }) {
        this._persistenceService = container.persistenceService;
    }

    getWindowOptions(): WindowOptions {
        const { x, y, width, height } = this._persistenceService.get('windowState') ?? { width: 800, height: 640 };
        return { width, height, x, y };
    }

    observeWindow(window: BrowserWindow): void {
        const saveState = () => {
            const { x, y, width, height } = window.getBounds();
            this._persistenceService.set('windowState', { x, y, width, height });
        };

        let timeoutId: Parameters<typeof clearTimeout>[0] | null = null;

        for (const event of ['resize', 'move'] as const) {
            window.on(event as 'resize', () => {
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                timeoutId = setTimeout(saveState, RESIZE_DEBOUNCE);
            });
        }

        window.on('close', () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            saveState();
        });
    }
}
