import { MODELS } from "../constants/models.js";
import { BaseRepository } from "./base.repository.js";

class OptionGroupRepository extends BaseRepository {
    constructor() {
        super(MODELS.optionGroup);
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

    async updateProductOptionGroup(productId, optionGroupId, data) {
        const { sortOrder, optionValues } = data;

        return await this.prisma.$transaction(async (tx) => {
            // 1. Update sortOrder in ProductOptionGroup if provided
            if (sortOrder !== undefined) {
                await tx.productOptionGroup.update({
                    where: {
                        productId_optionGroupId: {
                            productId,
                            optionGroupId
                        }
                    },
                    data: { sortOrder }
                });
            }

            // 2. Update or Create ProductOptionValues
            if (optionValues && optionValues.length > 0) {
                const upsertPromises = optionValues.map(ov => 
                    tx.productOptionValue.upsert({
                        where: {
                            productId_optionId: {
                                productId,
                                optionId: ov.optionId
                            }
                        },
                        update: { price: ov.price },
                        create: {
                            productId,
                            optionId: ov.optionId,
                            price: ov.price
                        }
                    })
                );
                await Promise.all(upsertPromises);
            }

            return { productId, optionGroupId, status: "updated" };
        });
    }
}

export const optionGroupRepository = new OptionGroupRepository();
