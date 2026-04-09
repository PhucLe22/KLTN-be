import { BaseRepository } from "./base.repository.js";

class StoreRepository extends BaseRepository {
    constructor() {
        super("store");
    }
}

export const storeRepository = new StoreRepository();

