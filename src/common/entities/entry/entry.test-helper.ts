import { Entry, EntryJsonBase } from './entry';

export type DummyEntryJson = EntryJsonBase & {
    type: 'dummy';
};

export class DummyEntry extends Entry {
    readonly type = 'dummy';
}

declare module './entry' {
    interface EntryJsonTypes {
        dummyEntry: DummyEntryJson;
    }
}
