import * as path from 'path';

import { remote } from 'electron';
import React from 'react';
import ReactDom from 'react-dom';

const MainWindow = () => {
    const homeDirectoryPath = remote.app.getPath('home');

    return <>
        <div>
            {homeDirectoryPath}
        </div>
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
