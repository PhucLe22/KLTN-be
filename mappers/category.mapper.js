import { getCategoriesSchema as outputGetCategoriesSchema, getCategoryBySlugSchema as outputGetCategoryBySlugSchema, createCategorySchema as outputCreateCategorySchema, updateCategorySchema as outputUpdateCategorySchema, deleteCategorySchema as outputDeleteCategorySchema } from "../contracts/output/category.output.schema.js";

export class CategoryMapper {
    static toGetAllCategoriesResponse(data) {
        return outputGetCategoriesSchema.response.parse(data);
    }

    static toGetCategoryBySlugResponse(data) {
        return outputGetCategoryBySlugSchema.response.parse(data);
    }

    static toCreateCategoryResponse(data) {
        return outputCreateCategorySchema.response.parse(data);
    }

    static toUpdateCategoryResponse(data) {
        return outputUpdateCategorySchema.response.parse(data);
    }

    static toDeleteCategoryResponse() {
        return outputDeleteCategorySchema.response.parse({ message: "Category deleted successfully" });
    }
}
