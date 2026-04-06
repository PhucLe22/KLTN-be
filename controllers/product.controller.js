import { BaseController } from "./base.controller.js";
import { productService } from "../services/product.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

class ProductController extends BaseController {
    constructor () {
        super(productService);
    }

    getAllProducts = asyncHandler(async (req, res) => {
    const result = await this.service.findAll();
    return this.success(res, {
        statusCode: SUCCESS_STATUS_CODE.OK,
        message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
        data: result,
    });
});

}

export const productController = new ProductController();
