import React from 'react';

import { useService } from '../../../hooks/use-service';
import { MarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller';
import { BrokenLinkIcon, ExternalLinkIcon, LinkIcon } from '../../icons';
import styles from './markdown-link.module.css';

export type Props = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

const brokenLinkIcon = (
    <span className={styles.icon}>
        {BrokenLinkIcon}
    </span>
);

const externalLinkIcon = (
    <span className={styles.icon}>
        {ExternalLinkIcon}
    </span>
);

const linkIcon = (
    <span className={styles.icon}>
        {LinkIcon}
    </span>
);

export const MarkdownLink = (props: Props) => {
    const {
        children: childrenProp,
        className: classNameProp,
        ...elementProps
    } = props;

    const viewerController = useService('markdownViewerController');

    const className = classNameProp == null ? styles.markdownLink : `${classNameProp} ${styles.markdownLink}`;

    const href = props.href;

    const icon =
        href == null ? brokenLinkIcon :
        viewerController.isExternalLink(href) ? externalLinkIcon :
        linkIcon;

    const onClick = React.useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        if (viewerController === null || href == null)
            return;
        const inNewTab = event.type === 'auxclick';
        viewerController.openLink({ href, inNewTab });
    }, [href, viewerController]);

    const onAuxClick = onClick;

    return (
        <a {...{ ...elementProps, className, onAuxClick, onClick }}>
            <span className={styles.content}>
                {childrenProp}
            </span>
            {icon}
        </a>
    );
};

declare module '../../../hooks/use-service' {
    interface Services {
        'components/viewers/markdown-viewer/markdown-link': {
            markdownViewerController: MarkdownViewerController;
        };
    }
}
