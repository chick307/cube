import type { DirectoryEntry, Entry, FileEntry, SymbolicLinkEntry } from '../../../common/entities/entry';
import type { FileSystem } from '../../../common/entities/file-system';
import { BinaryEntryView } from './binary-entry-view';
import { ComicEntryView, isComicEntry } from './comic-entry-view';
import { CssEntryView, isCssEntry } from './css-entry-view';
import { DirectoryEntryView } from './directory-entry-view';
import { ImageEntryView, isImageEntry } from './image-entry-view';
import { JavaScriptEntryView, isJavaScriptEntry } from './javascript-entry-view';
import { MarkdownEntryView, isMarkdownEntry } from './markdown-entry-view';
import { MediaEntryView, isMediaEntry } from './media-entry-view';
import { PdfEntryView, isPdfEntry } from './pdf-entry-view';
import { SymbolicLinkEntryView } from './symbolic-link-entry-view';
import { TextEntryView, isTextEntry } from './text-entry-view';

/* eslint-disable react/display-name */
export const entryViews = [
    ...([
        {
            id: 'directory-entry-view',
            name: 'Directory',
            test: () => true,
            render: (props) => (
                <DirectoryEntryView {...props} />
            ),
        },
    ] as {
        id: string;
        name: string;
        test: (entry: DirectoryEntry) => boolean;
        render: (props: { entry: DirectoryEntry; fileSystem: FileSystem; }) => React.ReactNode;
    }[]).map((entryView) => ({
        ...entryView,
        test: (entry: Entry) => entry.isDirectory() && entryView.test(entry),
        render: (props: { entry: Entry; fileSystem: FileSystem; }) =>
            entryView.render({ ...props, entry: props.entry as DirectoryEntry }),
    })),
    ...([
        {
            id: 'symbolic-link-view',
            name: 'Symbolic Link',
            test: (entry) => entry.isSymbolicLink(),
            render: (props) => <SymbolicLinkEntryView {...props} />,
        },
    ] as {
        id: string;
        name: string;
        test: (entry: SymbolicLinkEntry) => boolean;
        render: (props: { entry: SymbolicLinkEntry; fileSystem: FileSystem; }) => React.ReactNode;
    }[]).map((entryView) => ({
        ...entryView,
        test: (entry: Entry) => entry.isSymbolicLink() && entryView.test(entry),
        render: (props: {
            entry: Entry;
            fileSystem: FileSystem;
        }) => entryView.render({ ...props, entry: props.entry as SymbolicLinkEntry }),
    })),
    ...([
        {
            id: 'comic-entry-view',
            name: 'Comic',
            test: (entry) => isComicEntry(entry),
            render: (props) => <ComicEntryView {...props} />,
        },
        {
            id: 'css-entry-view',
            name: 'CSS',
            test: (entry) => isCssEntry(entry),
            render: (props) => <CssEntryView {...props} />,
        },
        {
            id: 'image-entry-view',
            name: 'Image',
            test: (entry) => isImageEntry(entry),
            render: (props) => <ImageEntryView {...props} />,
        },
        {
            id: 'javascript-entry-view',
            name: 'JavaScript',
            test: (entry) => isJavaScriptEntry(entry),
            render: (props) => <JavaScriptEntryView {...props} />,
        },
        {
            id: 'markdown-entry-view',
            name: 'Markdown',
            test: (entry) => isMarkdownEntry(entry),
            render: (props) => <MarkdownEntryView {...props} />,
        },
        {
            id: 'media-entry-view',
            name: 'Media',
            test: (entry) => isMediaEntry(entry),
            render: (props) => <MediaEntryView {...props} />,
        },
        {
            id: 'pdf-entry-view',
            name: 'PDF',
            test: (entry) => isPdfEntry(entry),
            render: (props) => <PdfEntryView {...props} />,
        },
        {
            id: 'text-entry-view',
            name: 'Text',
            test: (entry) => isTextEntry(entry),
            render: (props) => <TextEntryView {...props} />,
        },
        {
            id: 'binary-entry-view',
            name: 'Binary',
            test: (entry: Entry) => entry.isFile(),
            render: (props) => <BinaryEntryView {...props} />,
        },
    ] as {
        id: string;
        name: string;
        test: (entry: FileEntry) => boolean;
        render: (props: { entry: FileEntry; fileSystem: FileSystem; }) => React.ReactNode;
    }[]).map((fileEntryView) => ({
        ...fileEntryView,
        test: (entry: Entry) => entry.isFile() && fileEntryView.test(entry),
        render: (props: { entry: Entry; fileSystem: FileSystem; }) =>
            fileEntryView.render({ ...props, entry: props.entry as FileEntry }),
    })),
];
/* eslint-enable react/display-name */
