import { BaseController } from "./base.controller.js";
import { optionGroupService } from "../services/option-group.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { OptionMapper } from "../mappers/option.mapper.js";

class OptionGroupController extends BaseController {
    constructor() {
        super(optionGroupService);
    }

    createOptionGroup = asyncHandler(async (req, res) => {
        const body = req.body;
        console.log(body);
        const result = await this.service.create(body);
        const formatted = OptionMapper.toCreateOptionGroupResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.CREATED,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
            data: formatted
        });
    });
}

export const optionGroupController = new OptionGroupController();
