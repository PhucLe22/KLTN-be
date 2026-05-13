import { BaseController } from "./base.controller.js";
import { categoryService } from "../services/category.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { CategoryMapper } from "../mappers/category.mapper.js";

class CategoryController extends BaseController {
    constructor() {
        super(categoryService);
    }

    getAllCategories = asyncHandler(async (req, res) => {
        const result = await this.service.findAll(req.query);
        const formatted = CategoryMapper.toGetAllCategoriesResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });

    getCategoryBySlug = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const result = await this.service.findBySlug(slug);
        const formatted = CategoryMapper.toGetCategoryBySlugResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });

    createCategory = asyncHandler(async (req, res) => {
        const body = req.body;

        const result = await this.service.create(body);
        const formatted = CategoryMapper.toCreateCategoryResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.CREATED,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
            data: formatted
        });
    });

    updateCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        const result = await this.service.update(id, body);
        const formatted = CategoryMapper.toUpdateCategoryResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });

    deleteCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await this.service.delete(id);
        const formatted = CategoryMapper.toDeleteCategoryResponse();

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });
}

export const categoryController = new CategoryController();
