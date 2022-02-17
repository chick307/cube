import { DummyEntry } from '../../common/entities/entry.test-helper';
import { DummyFileSystem } from '../../common/entities/file-system.test-helper';
import { HistoryItem } from '../../common/entities/history-item';
import { Restate } from '../../common/utils/restate';
import { EntryPath } from '../../common/values/entry-path';
import { HistoryController, HistoryControllerState } from './history-controller';

export const createHistoryController = () => {
    const restate = new Restate<HistoryControllerState>({
        ableToGoBack: false,
        ableToGoForward: false,
        current: new HistoryItem({
            entry: new DummyEntry(new EntryPath('/a')),
            fileSystem: new DummyFileSystem(),
        }),
    });

    const historyController: HistoryController = {
        state: restate.state,
        goBack: () => {},
        goForward: () => {},
        navigate: (_item: HistoryItem) => {},
        replace: (_item: HistoryItem) => {},
    };

    return { historyController, restate };
};
