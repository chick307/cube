import React from 'react';

import styles from './button.css';

export type Props = React.ComponentProps<'button'>;

export const Button = (props: Props) => {
    const { className = '', onClick, ...buttonProps } = props;

    const onButtonClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick != null)
            onClick(event);
        if (!event.defaultPrevented)
            event.currentTarget.blur();
    }, []);

    return (
        <button className={`${className} ${styles.button}`} onClick={onButtonClick} {...buttonProps} />
    );
};
