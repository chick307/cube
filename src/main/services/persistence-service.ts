import ElectronStore from 'electron-store';

type PersistentData = {
    windowState?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
};

export type PersistenceService<T extends Partial<PersistentData> = PersistentData> = {
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K];
    set<K extends keyof T>(key: K, value: T[K]): void;
};

export class PersistenceServiceImpl extends ElectronStore<PersistentData> implements PersistenceService {
    constructor() {
        super({
            name: 'cube',
            projectVersion: '1.0.0',
        } as ElectronStore.Options<PersistentData>);
    }
}
