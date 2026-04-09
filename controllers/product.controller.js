import { BaseController } from "./base.controller.js";
import { productService } from "../services/product.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { getProductsSchema as outputGetProductsSchema } from "../contracts/output/product.output.schema.js";
import { getProductsSchema as inputGetProductsSchema } from "../contracts/input/product.schema.js";

class ProductController extends BaseController {
    constructor () {
        super(productService);
    }

    getAllProducts = asyncHandler(async (req, res) => {
        const query = inputGetProductsSchema.query.parse(req.query);
        const result = await this.service.findAll(query);

        const formattedItems = result.items.map(item => 
            outputGetProductsSchema.response.parse({
                ...item,
                price: item.basePrice // Map basePrice -> price
            })
        );
        
        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formattedItems,
            meta: result.meta
        });
    });
}

export const productController = new ProductController();
