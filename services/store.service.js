import { storeRepository } from "../repositories/store.repository.js";
import { buildStoreFilters, STORE_SELECT_FIELDS } from "../constants/storeFilters.js";

class StoreService {

    async findAll(query) {
        const { page = 1, limit = 10 } = query;
        
        const { where, sortBy, sortOrder } = buildStoreFilters(query);

        return await storeRepository.findAll({
            page,
            limit,
            where,
            select: STORE_SELECT_FIELDS,
            orderBy: { [sortBy]: sortOrder }
        });
    }

    async create(data) {
        return await storeRepository.create(data);
    }

    async update(id, data) {
        return await storeRepository.update(id, data);
    }

    async delete(id) {
        return await storeRepository.update(id, { isDeleted: true });
    }
}

export const storeService = new StoreService();