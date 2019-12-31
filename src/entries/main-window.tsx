import React from 'react';
import ReactDom from 'react-dom';

const MainWindow = () => {
    return <>
        Hello, World!
    </>;
};

ReactDom.render(<MainWindow />, document.querySelector('#container'));
