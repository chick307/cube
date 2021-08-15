import timers from 'timers';

export const immediate = () => {
    return new Promise<void>((resolve) => {
        timers.setImmediate(resolve);
    });
};
