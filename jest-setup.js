jest.mock('electron', () => {
    const notImplemented = () => {
        throw Error('Not implemented');
    };

    return {
        ipcRenderer: {
            invoke: notImplemented,
            sendSync: notImplemented,
        },
    }
});
