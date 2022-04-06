import { Blob } from 'node:buffer';
import { URL } from 'node:url';

import { jest } from '@jest/globals';

global.Blob = Blob;

global.IntersectionObserver = jest.fn(() => {
    return {
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    };
});

global.ResizeObserver = jest.fn(() => {
    return {
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    };
});

global.URL = URL;

global.jest = jest;

const notImplemented = () => {
    throw Error('Not implemented');
};

jest.unstable_mockModule('electron', async () => {
    return {
        ipcRenderer: {
            invoke: notImplemented,
            sendSync: notImplemented,
        },
        shell: {
            openExternal: notImplemented,
        },
    };
});
