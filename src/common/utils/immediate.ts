export const immediate = () => {
    return new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
};
