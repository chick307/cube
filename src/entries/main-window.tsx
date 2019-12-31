import * as fs from 'fs';
import * as path from 'path';

import { remote } from 'electron';
import React from 'react';
import ReactDom from 'react-dom';

const MainWindow = () => {
    const homeDirectoryPath = remote.app.getPath('home');

    const homeDirectoryEntries = fs.readdirSync(homeDirectoryPath);

    return <>
        <div>
            {homeDirectoryPath}
        </div>
        <ul>
            {homeDirectoryEntries.map((name) => (
                <li>
                    {name}
                </li>
            ))}
        </ul>
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
