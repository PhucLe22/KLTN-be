import { categoryService } from "../services/category.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { CategoryMap } from "../contracts/output/category.output.schema.js";

class CategoryController {
    list = asyncHandler(async (req, res) => {
        const categories = await categoryService.findAll(req.query);
        const result = mapper(categories.items, CategoryMap);

        return res.ok(result, categories.meta);
    });

    show = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const category = await categoryService.findBySlug(slug);
        const result = mapper(category, CategoryMap);

        return res.ok(result);
    });

    create = asyncHandler(async (req, res) => {
        const body = req.body;
        const category = await categoryService.create(body);
        const result = mapper(category, CategoryMap);

        return res.ok(result);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        const category = await categoryService.update(id, body);
        const result = mapper(category, CategoryMap);

        return res.ok(result);
    });

    remove = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await categoryService.delete(id);

        return res.ok();
    });
}

export const categoryController = new CategoryController();
