import { productService } from "../services/product.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { ProductMap } from "../contracts/output/product.output.schema.js";
import { uploadFromBuffer } from "../lib/cloudinary.js";

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

        // Generate slug first if image exists
        if (req.file) {
            const slug = body.slug || await productService.generateSlug(body.name);
            const result = await uploadFromBuffer(req.file.buffer, 'products', { public_id: slug });
            body.thumbnail = result.secure_url;
            body.slug = slug; // Ensure the same slug is used for DB
        }
        
        const product = await productService.create(body);
        const result = mapper(product, ProductMap);

        return res.ok(result);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        
        if (req.file) {
            // Get current slug or generate from new name
            let slug = body.slug;
            if (!slug) {
                const currentProduct = await productService.repository.findById(id);
                slug = body.name ? await productService.generateSlug(body.name) : currentProduct.slug;
            }

            const result = await uploadFromBuffer(req.file.buffer, 'products', { 
                public_id: slug,
                overwrite: true 
            });
            body.thumbnail = result.secure_url;
            body.slug = slug;
        }

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
