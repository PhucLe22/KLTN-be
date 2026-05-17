import { createOptionGroupSchema as outputCreateOptionGroupSchema } from "../contracts/output/option.output.schema.js";

export class OptionMapper {
    static toCreateOptionGroupResponse(data) {
        const processedData = {
            ...data,
            options: data.options ? data.options.map(opt => ({
                ...opt,
                basePrice: typeof opt.basePrice === 'number' ? opt.basePrice : Number(opt.basePrice)
            })) : []
        };

        return outputCreateOptionGroupSchema.response.parse(processedData);
    }
}
