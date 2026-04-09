import { BaseService } from "./base.service.js";
import { storeRepository } from "../repositories/store.repository.js";

class StoreService extends BaseService {
    constructor() {
        super(storeRepository);
    }

    async findAll(query) {
        const { page = 1, limit = 10, search } = query;
        
        const where = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        return await this.repository.findAll({
            page,
            limit,
            where,
            select: {
                id: true,
                name: true,
                address: true,
                hotline: true,
                lat: true,
                lng: true,
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export const storeService = new StoreService();