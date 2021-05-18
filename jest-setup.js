const notImplemented = () => {
    throw Error('Not implemented');
};

global.URL = {
    createObjectURL: notImplemented,
    revokeObjectURL: notImplemented,
};

jest.mock('electron', () => {
    return {
        ipcRenderer: {
            invoke: notImplemented,
            sendSync: notImplemented,
        },
    };
});
