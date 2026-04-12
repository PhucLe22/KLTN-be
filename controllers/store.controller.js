import { BaseController } from "./base.controller.js";
import { storeService } from "../services/store.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { StoreMapper } from "../mappers/store.mapper.js";

class StoreController extends BaseController {
    constructor() {
        super(storeService);
    }

    getAllStores = asyncHandler(async (req, res) => {
        const result = await this.service.findAll(req.query);
        const formattedItems = StoreMapper.toGetAllStoresResponse(result.items);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formattedItems,
            meta: result.meta
        });
    });
}

export const storeController = new StoreController();