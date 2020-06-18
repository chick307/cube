import React from 'react';

import { DirectoryEntry } from '../entities/directory-entry';
import { Entry } from '../entities/entry';
import { EntryStore } from '../stores/entry-store';

export type Props = {
    entry: DirectoryEntry;
    entryStore: EntryStore;
};

const DirectoryEntryView = (props: { entry: Entry; onEntryClick: (entry: Entry) => void; }) => {
    const { entry, onEntryClick } = props;

    const onClick = React.useCallback(() => { onEntryClick(entry); }, [entry, onEntryClick]);

    return <>
        <span onDoubleClick={onClick}>
            {entry.name.toString()}
        </span>
    </>;
};

export const DirectoryView = (props: Props) => {
    const { entry, entryStore } = props;

    const entries = React.useMemo(() => entryStore.localFileSystemService.getDirectoryEntries(entry), [entry, entryStore]);

    const onEntryClick = React.useCallback((entry: Entry) => {
        entryStore.setEntry(entry);
    }, [entryStore]);

    return <>
        <ul>
            {entries.map((entry) => (
                <li key={entry.name.toString()}>
                    <DirectoryEntryView entry={entry} onEntryClick={onEntryClick} />
                </li>
            ))}
        </ul>
    </>;
};
