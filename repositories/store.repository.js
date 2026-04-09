const MODEL_NAME = "store";
import { BaseRepository } from "./base.repository.js";

class StoreRepository extends BaseRepository {
    constructor() {
        super(MODEL_NAME);
    }
}

export const storeRepository = new StoreRepository();

