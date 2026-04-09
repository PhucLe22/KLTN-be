import { BaseController } from "./base.controller.js";
import { storeService } from "../services/store.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { getStoresSchema as outputGetStoresSchema } from "../contracts/output/store.output.schema.js";
import { getStoresSchema as inputGetStoresSchema } from "../contracts/input/store.schema.js";

class StoreController extends BaseController {
    constructor() {
        super(storeService);
    }

    getAllStores = asyncHandler(async (req, res) => {
        const query = inputGetStoresSchema.query.parse(req.query);
        const result = await this.service.findAll(query);

        const formattedItems = result.items.map(item => 
            outputGetStoresSchema.response.parse(item)
        );

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formattedItems,
            meta: result.meta
        });
    });
}

export const storeController = new StoreController();