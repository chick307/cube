import React from 'react';

import { useStore } from '../hooks/use-store';
import { EntryStore } from '../stores/entry-store';
import { DirectoryView } from './directory-view';
import { FileView } from './file-view';

export type Props = {
    entryStore: EntryStore;
};

export const EntryView = (props: Props) => {
    const { entryStore } = props;

    const { entry } = useStore(entryStore);

    const view =
        entry.isDirectory() ? <DirectoryView {...{ entry, entryStore }} /> :
        entry.isFile() ? <FileView {...{ entry, entryStore }} /> :
        <></>;

    return <>
        <div>
            <div>
                {entry.path.toString()}
            </div>
            <div>
                {view}
            </div>
        </div>
    </>;
};
