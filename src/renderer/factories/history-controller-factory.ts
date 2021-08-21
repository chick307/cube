import { HistoryController, HistoryControllerImpl, HistoryItem } from '../controllers/history-controller';

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
