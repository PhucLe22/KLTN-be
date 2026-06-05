import { OrderStatus, OrderType } from "../constants/enum.js";
import { MODELS } from "../constants/models.js";
import { BaseRepository } from "./base.repository.js";

class StoreRepository extends BaseRepository {
    constructor() {
        super(MODELS.store);
    }
}

export const storeRepository = new StoreRepository();

