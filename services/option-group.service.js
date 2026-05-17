import { BaseService } from "./base.service.js";
import { optionGroupRepository } from "../repositories/option-group.repository.js";

class OptionGroupService extends BaseService {
    constructor() {
        super(optionGroupRepository);
    }

    async create(data) {
        return await this.repository.create(data);
    }
}

export const optionGroupService = new OptionGroupService();
