import { userRepository } from "../repositories/user.repository.js";
import { buildUserFilters, USER_SELECT_FIELDS } from "../constants/userFilters.js";
import { USER_FILTERS } from "../constants/userFilters.js";

class UserService  {
    async findAll(query) {
        const { page = 1, limit = 10 } = query;
        
        const { where, sortBy, sortOrder } = buildUserFilters(query);

        return await storeRepository.findAll({
            page,
            limit,
            where,
            select: USER_SELECT_FIELDS,
            orderBy: { [sortBy]: sortOrder }
        });
    }

    async create(data) {
        return await storeRepository.create(data);
    }

    async update(id, data) {
        const { isActive, role, store_id, ...rest } = data;
        const updateData = { ...rest };

        if (isActive != null) {
            updateData.isActive = isActive;
        }

        if (role != null || store_id != null) {
            const staffUpdate = {};

            if (role != null) {
                staffUpdate.role = role;
            }

            if (store_id != null) {
                staffUpdate.storeId = store_id;
            }

            if (Object.keys(staffUpdate).length) {
                updateData.staff = { update: staffUpdate };
            }
        }

        return await storeRepository.update(id, updateData);
    }

    async remove(id) {
        return await storeRepository.update(id, { isActive: false });
    }
}

export const userService = new UserService();
