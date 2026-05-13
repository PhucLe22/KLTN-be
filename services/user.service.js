import { BaseService } from "./base.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { buildUserFilters, USER_SELECT_FIELDS } from "../constants/userFilters.js";
import { USER_FILTERS } from "../constants/userFilters.js";

class UserService extends BaseService {
    constructor() {
        super(userRepository);
    }

    async findAll(query) {
        const { page = 1, limit = 10 } = query;
        
        const { where, sortBy, sortOrder } = buildUserFilters(query);

        return await this.repository.findAll({
            page,
            limit,
            where,
            select: USER_SELECT_FIELDS,
            orderBy: { [sortBy]: sortOrder }
        });
    }

    async create(data) {
        return await this.repository.create(data);
    }

    async update(id, data) {
        return await this.repository.update(id, data);
    }

    async updateUser(id, data) {
        console.log(data);
        const { isActive, role, store_id } = data;
        
        const updateData = {};
        
        // Only update provided fields
        if (isActive !== null) {
            updateData.isActive = isActive;
        }
        
        // Handle role and store_id updates - only if user has staff relationship
        if (role !== null || store_id !== null) {
            updateData.staff = {
                update: {
                    ...(updateData.staff?.update || {}),
                    ...(role && { role }),
                    ...(store_id && { storeId: store_id })
                }
            };
        }
        
        return await this.repository.update(id, updateData);
    }

    async deleteUser(id) {
        return await this.repository.update(id, { isActive: false });
    }
}

export const userService = new UserService();
