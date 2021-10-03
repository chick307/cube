import React from 'react';

import { GatewayProps, useGateway } from '../hooks/use-gateway';

export type StatusBarGatewayProps = {
    children?: React.ReactNode;
};

export type StatusBarProviderProps = {
    active?: boolean | null | undefined;
    children?: React.ReactNode;
};

const Context = React.createContext<React.FunctionComponent<GatewayProps>>(() => null);

export const useStatusBar = (): {
    /* eslint-disable @typescript-eslint/naming-convention */
    StatusBarExit: React.FunctionComponent;
    StatusBarProvider: React.FunctionComponent<StatusBarProviderProps>;
    /* eslint-enable @typescript-eslint/naming-convention */
} => {
    const { Exit, Gateway } = useGateway();

    const StatusBarExit = Exit;

    const StatusBarProvider = React.useCallback((props: StatusBarProviderProps) => {
        const active = props.active == null || props.active;
        return (
            <Context.Provider value={active ? Gateway : () => null}>
                {props.children}
            </Context.Provider>
        );
    }, []);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { StatusBarExit, StatusBarProvider };
};

export const useStatusBarGateway = (): React.FunctionComponent<StatusBarGatewayProps> => {
    return React.useContext(Context);
};
