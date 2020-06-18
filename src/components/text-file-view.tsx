import fs from 'fs';

import React from 'react';

import { FileEntry } from '../entities/file-entry';

export type Props = {
    entry: FileEntry;
};

export const TextFileView = (props: Props) => {
    const { entry } = props;

    const content = React.useMemo(() => fs.readFileSync(entry.path.toString(), 'utf8'), [entry]);

    return <>
        <pre>
            {content}
        </pre>
    </>;
};
