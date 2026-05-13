import { BaseService } from "./base.service.js";
import { storeRepository } from "../repositories/store.repository.js";
import { buildStoreFilters, STORE_SELECT_FIELDS } from "../constants/storeFilters.js";

class StoreService extends BaseService {
    constructor() {
        super(storeRepository);
    }

    async findAll(query) {
        const { page = 1, limit = 10 } = query;
        
        const { where, sortBy, sortOrder } = buildStoreFilters(query);

        return await this.repository.findAll({
            page,
            limit,
            where,
            select: STORE_SELECT_FIELDS,
            orderBy: { [sortBy]: sortOrder }
        });
    }

    async create(data) {
        return await this.repository.create(data);
    }

    async update(id, data) {
        return await this.repository.update(id, data);
    }

    async delete(id) {
        return await this.repository.update(id, { isDeleted: true });
    }
}

export const storeService = new StoreService();