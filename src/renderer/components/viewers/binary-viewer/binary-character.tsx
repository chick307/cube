import React from 'react';

import styles from './binary-character.module.css';

export type Props = {
    className?: string | undefined;

    codePoint: number | null | undefined;
};

export const BinaryCharacter = (props: Props) => {
    const {
        className: classNameProp,
        codePoint,
    } = props;

    const {
        character,
        controlCharacter,
    } = React.useMemo(() => {
        try {
            if (codePoint == null)
                return { character: '\uFFFD', controlCharacter: true };
            if (codePoint === 0x7F)
                return { character: '\u2421', controlCharacter: true };
            if (codePoint <= 0x20)
                return { character: String.fromCodePoint(0x2400 + codePoint), controlCharacter: true };
            return { character: String.fromCodePoint(codePoint), controlCharacter: false };
        } catch {
            return { character: '\uFFFD', controlCharacter: true };
        }
    }, [codePoint]);

    const classList = [styles.binaryCharacter];
    if (controlCharacter)
        classList.push(styles.controlCharacter);
    if (classNameProp != null)
        classList.push(classNameProp);

    const className = classList.join(' ');

    return (
        <div {...{ className }}>
            {character}
        </div>
    );
};
