import { Entry } from './entry';

export class SymbolicLinkEntry extends Entry {
    readonly type = 'symbolic-link';

    isSymbolicLink(): this is SymbolicLinkEntry {
        return true;
    }

    toJson() {
        return {
            ...super.toJson(),
            type: 'symbolic-link',
        };
    }
}

declare module './entry' {
    interface Entry {
        isSymbolicLink(): this is SymbolicLinkEntry;
    }
}

Entry.prototype.isSymbolicLink = () => false;
