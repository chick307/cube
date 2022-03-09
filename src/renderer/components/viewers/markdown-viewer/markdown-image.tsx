import React from 'react';

import { useService } from '../../../hooks/use-service';
import { useTask } from '../../../hooks/use-task';
import { MarkdownViewerController } from '../../../viewer-controllers/markdown-viewer-controller';
import { FileDeleteIcon } from '../../icons';
import styles from './markdown-image.module.css';

export type Props = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const MarkdownImage = (props: Props) => {
    const {
        alt: altProp,
        className: classNameProp,
        src: srcProp,
        ...elementProps
    } = props;

    const viewerController = useService('markdownViewerController');

    const className = classNameProp == null ? styles.markdownImage : `${classNameProp} ${styles.markdownImage}`;

    const [{ blob = null, loaded = false } = {}, error] = useTask(async () => {
        if (srcProp == null)
            return { blob: null, loaded: true };
        const blob = await viewerController?.loadImage({ src: srcProp });
        return { blob, loaded: true };
    }, [viewerController]);

    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (blob === null)
            return;
        const url = URL.createObjectURL(blob);
        setUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    const imageElement =
        url !== null ? <img src={url} {...{ ...elementProps }} /> :
        (loaded || error != null) ? <span className={styles.altText}>{FileDeleteIcon}{altProp || srcProp}</span> :
        null;

    return (
        <span {...{ className }} data-src={srcProp ?? ''}>
            {imageElement}
        </span>
    );
};

declare module '../../../hooks/use-service' {
    interface Services {
        'components/viewers/markdown-viewer/markdown-image': {
            markdownViewerController: MarkdownViewerController;
        };
    }
}
