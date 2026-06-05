import { storeService } from "../services/store.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { StoreMap } from "../contracts/output/store.output.schema.js";

class StoreController {
    list = asyncHandler(async (req, res) => {
        const stores = await storeService.findAll(req.query);
        const result = mapper(stores.items, StoreMap);

        return res.ok(result, stores.meta);
    });

    create = asyncHandler(async (req, res) => {
        const body = req.body;
        const store = await storeService.create(body);
        const result = mapper(store, StoreMap);

        return res.ok(result);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        const store = await storeService.update(id, body);
        const result = mapper(store, StoreMap);

        return res.ok(result);
    });

    remove = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await storeService.delete(id);

        return res.ok();
    });
}

export const storeController = new StoreController();
