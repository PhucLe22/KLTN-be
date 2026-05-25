import { BaseRepository } from "./base.repository.js";

class OptionGroupRepository extends BaseRepository {
    constructor() {
        super("optionGroup");
    }

    async create(data, tx = null) {
        const model = this.getModel(tx);
        
        // Handle nested creation for options if they exist
        const createData = { ...data };
        
        if (createData.options && createData.options.length > 0) {
            const options = createData.options;
            delete createData.options;
            
            return await model.create({
                data: {
                    ...createData,
                    options: {
                        create: options
                    }
                },
                include: {
                    options: true
                }
            });
        }
        
        return await model.create({
            data: createData,
            include: {
                options: true
            }
        });
    }
}

export const optionGroupRepository = new OptionGroupRepository();
