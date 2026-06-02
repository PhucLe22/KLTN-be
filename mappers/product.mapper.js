import { 
    getProductsSchema as outputGetProductsSchema, 
    createProductSchema as outputCreateProductSchema, 
    updateProductSchema as outputUpdateProductSchema, 
    deleteProductSchema as outputDeleteProductSchema,
    getProductBySlugSchema as outputGetProductBySlugSchema
} from "../contracts/output/product.output.schema.js";

export class ProductMapper {
    static toGetAllProductsResponse(data) {
        // Convert Decimal values to numbers for Zod validation
        const processedData = {
            items: data.items.map(item => ({
                ...item,
                basePrice: typeof item.basePrice === 'number' ? item.basePrice : Number(item.basePrice),
                costPrice: typeof item.costPrice === 'number' ? item.costPrice : Number(item.costPrice),
                taxRate: typeof item.taxRate === 'number' ? item.taxRate : Number(item.taxRate),
            })),
            meta: {
                totalItems: data.meta.totalItems,
                currentPage: data.meta.currentPage,
                totalPages: data.meta.totalPages,
                hasNext: data.meta.hasNext
            }
        };

        return outputGetProductsSchema.response.parse(processedData);
    }

    static toGetProductBySlugResponse(data) {
        if (!data) return null;

        const processedData = {
            ...data,
            basePrice: typeof data.basePrice === 'number' ? data.basePrice : Number(data.basePrice),
            costPrice: typeof data.costPrice === 'number' ? data.costPrice : Number(data.costPrice),
            taxRate: typeof data.taxRate === 'number' ? data.taxRate : Number(data.taxRate),
            optionGroups: data.optionGroups?.map(og => ({
                id: og.optionGroup.id,
                name: og.optionGroup.name,
                isRequired: og.optionGroup.isRequired,
                isMultiple: og.optionGroup.isMultiple,
                sortOrder: og.optionGroup.sortOrder,
                options: og.optionGroup.options.map(opt => {
                    const productValue = data.optionValues?.find(ov => ov.optionId === opt.id);
                    return {
                        ...opt,
                        basePrice: typeof opt.basePrice === 'number' ? opt.basePrice : Number(opt.basePrice),
                        price: productValue ? (typeof productValue.price === 'number' ? productValue.price : Number(productValue.price)) : null
                    };
                })
            })),
        };

        // Remove optionValues from the final object as it's now merged into options
        delete processedData.optionValues;

        return outputGetProductBySlugSchema.response.parse(processedData);
    }

    static toCreateProductResponse(data) {
        // Convert Decimal values to numbers for Zod validation
        const processedData = {
            ...data,
            basePrice: typeof data.basePrice === 'number' ? data.basePrice : Number(data.basePrice),
            costPrice: typeof data.costPrice === 'number' ? data.costPrice : Number(data.costPrice),
            taxRate: typeof data.taxRate === 'number' ? data.taxRate : Number(data.taxRate),
        };

        return outputCreateProductSchema.response.parse(processedData);
    }

    static toUpdateProductResponse(data) {
        // Convert Decimal values to numbers for Zod validation
        const processedData = {
            ...data,
            basePrice: typeof data.basePrice === 'number' ? data.basePrice : Number(data.basePrice),
            costPrice: typeof data.costPrice === 'number' ? data.costPrice : Number(data.costPrice),
            taxRate: typeof data.taxRate === 'number' ? data.taxRate : Number(data.taxRate),
        };

        return outputUpdateProductSchema.response.parse(processedData);
    }

    static toDeleteProductResponse() {
        return outputDeleteProductSchema.response.parse({ message: "Product deleted successfully" });
    }
}
