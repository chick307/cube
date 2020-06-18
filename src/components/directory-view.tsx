import React from 'react';

import { DirectoryEntry } from '../entities/directory-entry';
import { Entry } from '../entities/entry';
import { LocalFileSystemService } from '../services/local-file-system-service';

export type Props = {
    entry: DirectoryEntry;
    localFileSystemService: LocalFileSystemService;
    navigator: {
        open: (entry: Entry) => void;
    };
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
    const { entry, localFileSystemService, navigator } = props;
    const entries = React.useMemo(() => localFileSystemService.getDirectoryEntries(entry), [entry, localFileSystemService]);
    const onEntryClick = React.useCallback((entry: Entry) => {
        navigator.open(entry);
    }, [navigator]);
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
