import type { HistoryItem } from '../../common/entities/history-item';
import { HistoryController, HistoryControllerImpl } from '../controllers/history-controller';

export type HistoryControllerFactory = {
    create(params: CreateParameters): HistoryController;
};

export type CreateParameters = {
    initialHistoryItem: HistoryItem;
};

export class HistoryControllerFactoryImpl implements HistoryControllerFactory {
    create(params: CreateParameters): HistoryController {
        const historyController = new HistoryControllerImpl({
            initialHistoryItem: params.initialHistoryItem,
        });
        return historyController;
    }
}
