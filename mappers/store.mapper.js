import { getStoresSchema as outputGetStoresSchema } from "../contracts/output/store.output.schema.js";

export class StoreMapper {
  static toGetAllStoresResponse(items) {
    return items.map(item => outputGetStoresSchema.response.parse(item));
  }
}
