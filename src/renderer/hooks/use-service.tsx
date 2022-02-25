import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Services {}

export type ServiceName = { [Namespace in keyof Services]: keyof Services[Namespace]; }[keyof Services];

export type ServiceTypes = {
    [Name in ServiceName]: {
        [Namespace in keyof Services]: Services[Namespace] extends { [N in Name]: infer R; } ? (r: R) => void : never;
    }[keyof Services] extends ((r: infer R) => void) ? R : never;
    // `(((a: A) => void) | ((b: B) => void)) extends ((r: infer R) => void) ? R : never` is the same as `A & B`
};

export type PartialServiceTypes = Partial<{
    [Name in ServiceName]: {
        [Namespace in keyof Services]: Services[Namespace] extends { [N in Name]: infer R; } ? R : never;
    }[keyof Services];
}>;

const Context = React.createContext<PartialServiceTypes | null>(null);

export const ServiceProvider = <Name extends ServiceName>(props: {
    children?: React.ReactNode | undefined;
    name: Name;
    value: PartialServiceTypes[Name];
}) => {
    const {
        children,
        name,
        value: valueProp,
    } = props;

    const services = React.useContext(Context);

    const providerProps = React.useMemo(() => {
        const value = { ...services, [name]: valueProp };
        return { children, value };
    }, [children, services, name, valueProp]);

    return <Context.Provider {...providerProps} />;
};

export const ServicesProvider = (props: {
    children?: React.ReactNode | undefined;
    value: PartialServiceTypes;
}) => {
    const {
        children,
        value: valueProp,
    } = props;

    const services = React.useContext(Context);

    const providerProps = React.useMemo(() => {
        const value = { ...services, ...valueProp };
        return { children, value };
    }, [children, services, valueProp]);

    return <Context.Provider {...providerProps} />;
};

export const useService = <Name extends ServiceName>(name: Name): ServiceTypes[Name] => {
    const services = React.useContext(Context);
    if (services === null)
        throw Error(`Service "${name}" is not provided`);
    const service = services[name];
    if (service === undefined)
        throw Error(`Service "${name}" is not provided`);
    return service as ServiceTypes[Name];
};
