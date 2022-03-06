import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export type Options = {
    styles: {
        [name: string]: string;
    };
};

export const rehypeCssModules = (options: Options) => {
    const {
        styles,
    } = options;

    return (root: Root) => {
        visit(root, 'element', (node) => {
            const classList = node.properties?.className as string[] | null | undefined;
            if (classList != null) {
                const newClassList = classList
                    .filter((className) => className in styles)
                    .map((className) => styles[className]);
                Reflect.set(Reflect.get(node, 'properties'), 'className', newClassList);
            }
        });
    };
};
