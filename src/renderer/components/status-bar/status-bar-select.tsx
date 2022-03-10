import React from 'react';
import styles from './status-bar-select.module.css';

export type Props<T> = {
    className?: string | undefined;

    onChange: (value: T) => unknown;

    options: Option<T>[];

    value: T;
};

export type Option<T> = {
    label: string;
    value: T;
};

export const StatusBarSelect = Object.assign(<T, >(props: Props<T>) => {
    const {
        className: classNameProp,
        options: optionsProp,
    } = props;

    const className = classNameProp == null ? styles.selectContainer : `${classNameProp} ${styles.selectContainer}`;

    const index = optionsProp.findIndex((option) => Object.is(option.value, props.value));

    const label = index === -1 ? null : optionsProp[index].label;

    const onChange = React.useCallback((event: React.ChangeEvent) => {
        const target = event.target as HTMLSelectElement;
        const index = parseInt(target.value, 10);
        const option = optionsProp[index];
        if (option == null)
            return;
        props.onChange(option.value);
        target.blur();
    }, [optionsProp]);

    const options = optionsProp.map(({ label }, index) => {
        return (
            <option key={index} value={`${index}`}>{label}</option>
        );
    });

    const value = `${index}`;

    return (
        <div {...{ className }}>
            <div className={styles.label}>
                {label}
            </div>
            <select className={styles.select} {...{ onChange, value }}>
                {options}
            </select>
        </div>
    );
}, {
    useOptions: <T, >(callback: () => Option<T>[], deps: React.DependencyList) => {
        const options = React.useMemo(() => {
            const options = callback();
            return options;
        }, deps);
        return options;
    },
});
