import { storeRepository } from "../repositories/store.repository.js";
import { buildStoreFilters, STORE_SELECT_FIELDS } from "../constants/storeFilters.js";
import { geocodeAddress } from "../lib/geocoding.js";

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
        if (data.address) {
            try {
                const { lat, lng } = await geocodeAddress(data.address);
                data.lat = lat;
                data.lng = lng;
            } catch (error) {
                console.error("Geocoding failed during store creation:", error.message);
            }
        }
        return await storeRepository.create(data);
    }

    async update(id, data) {
        if (data.address) {
            try {
                const { lat, lng } = await geocodeAddress(data.address);
                data.lat = lat;
                data.lng = lng;
            } catch (error) {
                console.error("Geocoding failed during store update:", error.message);
            }
        }
        return await storeRepository.update(id, data);
    }

    async delete(id) {
        return await storeRepository.update(id, { isDeleted: true });
    }
}

export const storeService = new StoreService();