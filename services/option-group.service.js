import { optionGroupRepository } from "../repositories/option-group.repository.js";

class OptionGroupService {

    async findAll(query = {}) {
        const { page = 1, limit = 20 } = query;
        return await optionGroupRepository.findAll({
            page: Number(page),
            limit: Number(limit),
            where: { isActive: true },
            include: {
                options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } }
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async create(data) {
    const { name, storeId, isRequired, isMultiple, sortOrder, options = [] } = data;

        return await optionGroupRepository.create({
        name,
        storeId,
        isRequired,
        isMultiple,
        sortOrder,
        options: {
            create: options.map(opt => ({
                name: opt.name,
                basePrice: opt.basePrice,
                sortOrder: opt.sortOrder,
            }))
        }
    })
    // Return group with options
    }
}
export const optionGroupService = new OptionGroupService();

