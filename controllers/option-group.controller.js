import { optionGroupService } from "../services/option-group.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { OptionGroupMap } from "../contracts/output/option.output.schema.js";

class OptionGroupController {
    createOptionGroup = asyncHandler(async (req, res) => {
        const body = req.body;
        const optionGroup = await optionGroupService.create(body);
        const result = mapper(optionGroup, OptionGroupMap);

        return res.ok(result);
    });
}

export const optionGroupController = new OptionGroupController();
