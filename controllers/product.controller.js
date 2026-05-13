import { BaseController } from "./base.controller.js";
import { productService } from "../services/product.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { ProductMapper } from "../mappers/product.mapper.js";

class ProductController extends BaseController {
    constructor() {
        super(productService);
    }

    getAllProducts = asyncHandler(async (req, res) => {
        const result = await this.service.findAll(req.query);
        const formattedItems = ProductMapper.toGetAllProductsResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formattedItems
        });
    });

    getProductBySlug = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const result = await this.service.findBySlug(slug);

        if (!result) {
            return this.error(res, {
                statusCode: 404,
                message: "Product not found"
            });
        }

        const formatted = ProductMapper.toGetProductBySlugResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });

    createProduct = asyncHandler(async (req, res) => {
        const body = req.body;

        const result = await this.service.create(body);
        const formatted = ProductMapper.toCreateProductResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.CREATED,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
            data: formatted
        });
    });

    updateProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        const result = await this.service.update(id, body);
        const formatted = ProductMapper.toUpdateProductResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });

    deleteProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await this.service.delete(id);
        const formatted = ProductMapper.toDeleteProductResponse();

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });
}

export const productController = new ProductController();
