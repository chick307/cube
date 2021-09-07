import timers from 'timers';

export const immediate = () => {
    return new Promise<void>((resolve) => {
        timers.setImmediate(resolve);
    });
};

export const timeout = () => {
    return new Promise<void>((resolve) => {
        timers.setTimeout(resolve, 0);
    });
};
