import Entry from './entry';

export class SymbolicLinkEntry extends Entry {
    readonly type = 'symbolic-link';

    isSymbolicLink(): this is SymbolicLinkEntry {
        return true;
    }
}

declare module './entry' {
    interface Entry {
        isSymbolicLink(): this is SymbolicLinkEntry;
    }
}

Entry.prototype.isSymbolicLink = () => false;
