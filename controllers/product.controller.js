import { BaseController } from "./base.controller.js";
import { productService } from "../services/product.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { ProductMapper } from "../mappers/product.mapper.js";

class ProductController extends BaseController {
    constructor () {
        super(productService);
    }

    getAllProducts = asyncHandler(async (req, res) => {
        const result = await this.service.findAll(req.query);
        const formattedItems = ProductMapper.toGetAllProductsResponse(result.items);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formattedItems,
            meta: result.meta
        });
    });

    getProductBySlug = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const result = await this.service.findBySlug(slug);
        const formatted = ProductMapper.toGetProductBySlugResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });
}

export const productController = new ProductController();
