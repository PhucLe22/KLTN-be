import { getStoresSchema as outputGetStoresSchema, createStoreSchema as outputCreateStoreSchema, updateStoreSchema as outputUpdateStoreSchema, deleteStoreSchema as outputDeleteStoreSchema } from "../contracts/output/store.output.schema.js";

export class StoreMapper {
  static toGetAllStoresResponse(items) {
    return items.map(item => outputGetStoresSchema.response.parse(item));
  }

  static toCreateStoreResponse(data) {
    return outputCreateStoreSchema.response.parse(data);
  }

  static toUpdateStoreResponse(data) {
    return outputUpdateStoreSchema.response.parse(data);
  }

  static toDeleteStoreResponse(data) {
    return outputDeleteStoreSchema.response.parse({
      message: SUCCESS_MESSAGES.STORE_DELETED
    });
  }
}
