import React from 'react';

export type GatewayProps = {
    children?: React.ReactNode;
};

export const useGateway = (): {
    Exit: React.FunctionComponent;
    Gateway: React.FunctionComponent<GatewayProps>;
} => {
    const nodeRef = React.useRef<React.ReactNode>(null);
    const callbacksRef = React.useRef<((node: React.ReactNode) => void)[]>([]);

    const Exit = React.useCallback(() => {
        const [node, setNode] = React.useState<React.ReactNode>(null);
        React.useEffect(() => {
            setNode(nodeRef.current);
            callbacksRef.current.push(setNode);
            return () => {
                const index = callbacksRef.current.indexOf(setNode);
                callbacksRef.current.splice(index, 1);
            };
        }, []);
        return <>{node}</>;
    }, []);

    const Gateway = React.useCallback((props: GatewayProps) => {
        const { children } = props;
        React.useEffect(() => {
            nodeRef.current = children;
            for (const callback of callbacksRef.current)
                callback(children);
            return () => {
                nodeRef.current = null;
                for (const callback of callbacksRef.current)
                    callback(null);
            };
        }, [children]);
        return null;
    }, []);

    return {
        Exit,
        Gateway,
    };
};
