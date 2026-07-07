import { OrderStatus, OrderType } from "../constants/enum.js";
import { MODELS } from "../constants/models.js";
import { BaseRepository } from "./base.repository.js";

class StoreRepository extends BaseRepository {
    constructor() {
        super(MODELS.store);
    }

    async findByIds(ids, tx = null) {
        return await this.getModel(tx).findMany({
            where: {
                id: { in: ids }
            }
        });
    }

    async getAllActiveStoreIds(tx = null) {
        const result = await this.findAll({
            where: { isActive: true, isDeleted: false },
            select: { id: true },
            limit: 1000 
        }, tx);
        return result.items.map(s => s.id);
    }
}

export const storeRepository = new StoreRepository();

