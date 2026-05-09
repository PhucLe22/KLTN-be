import {
  getProductsSchema as outputGetProductsSchema,
  getProductBySlugSchema as outputGetProductBySlugSchema,
} from "../contracts/output/product.output.schema.js";

export class ProductMapper {
  static toGetAllProductsResponse(items) {
    return items.map(item =>
      outputGetProductsSchema.response.parse({
        ...item,
        price: item.basePrice,
        preparationTime: item.preparationTime || 15,
      })
    );
  }

  static toGetProductBySlugResponse(item) {
    return outputGetProductBySlugSchema.response.parse({
      ...item,
      price: item.basePrice,
      preparationTime: item.preparationTime || 15,
    });
  }
}
