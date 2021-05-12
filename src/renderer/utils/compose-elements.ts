import React from 'react';

export type ProviderValue<T> = [React.Provider<T>, T];

export const composeElements = (
    nodes: readonly [...React.ReactElement[], React.ReactNode],
    children?: React.ReactNode,
): JSX.Element => {
    const first = nodes[nodes.length - 1] as React.ReactNode;
    const result = (nodes.slice(0, -1).reverse() as React.ReactElement[])
        .reduce((children, node) => React.cloneElement(node, {}, children), first);
    return result as JSX.Element;
};
