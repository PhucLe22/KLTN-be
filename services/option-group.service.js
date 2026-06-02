import { BaseService } from "./base.service.js";
import { optionGroupRepository } from "../repositories/option-group.repository.js";

class OptionGroupService extends BaseService {
    constructor() {
        super(optionGroupRepository);
    }

    // async create(data) {
    //     return await this.repository.create(data);
    // }

    async create(data) {
    const { name, storeId, isRequired, isMultiple, sortOrder, options = [] } = data;

    return await this.repository.create({
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

