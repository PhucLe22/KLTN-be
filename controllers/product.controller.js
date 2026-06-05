import { productService } from "../services/product.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { ProductMap } from "../contracts/output/product.output.schema.js";

class ProductController {
    list = asyncHandler(async (req, res) => {
        const products = await productService.findAll(req.query);
        const result = mapper(products.items, ProductMap);

        return res.ok(result, products.meta);
    });

    show = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const product = await productService.findBySlug(slug);

        const result = mapper(product, ProductMap);

        return res.ok(result);
    });

    create = asyncHandler(async (req, res) => {
        const body = req.body;
        const product = await productService.create(body);
        const result = mapper(product, ProductMap);

        return res.ok(result);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        const product = await productService.update(id, body);
        const result = mapper(product, ProductMap);

        return res.ok(result);
    });

    updateOptionGroup = asyncHandler(async (req, res) => {
        const { id, optionGroupId } = req.params;
        const body = req.body;
        const product = await productService.updateProductOptionGroup(id, optionGroupId, body);
        
        return res.ok(product, null, "Product option group updated successfully");
    });

    remove = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productService.delete(id);

        return res.ok();
    });
}

export const productController = new ProductController();
