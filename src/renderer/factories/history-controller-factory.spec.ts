import { Entry } from '../../common/entities/entry';
import { FileSystem } from '../../common/entities/file-system';
import { HistoryItem } from '../../common/entities/history-item';
import { HistoryControllerImpl } from '../controllers/history-controller';
import { HistoryControllerFactoryImpl } from './history-controller-factory';

const entryA = Entry.fromJson({ type: 'directory', path: '/a' });
const fileSystem = new FileSystem();
const historyItemA = new HistoryItem({ entry: entryA, fileSystem });

describe('HistoryControllerFactory type', () => {
    describe('historyContollerFactory.create() method', () => {
        test('it creates a new HistoryController', () => {
            const historyControllerFactory = new HistoryControllerFactoryImpl();
            const result = historyControllerFactory.create({ initialHistoryItem: historyItemA });
            expect(result).toBeInstanceOf(HistoryControllerImpl);
        });
    });
});
