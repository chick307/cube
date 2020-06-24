import React from 'react';

import styles from './button.css';

export type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = (props: Props) => {
    const { className = '', ...buttonProps } = props;

    return <>
        <button className={`${className} ${styles.button}`} {...buttonProps} />
    </>;
};
