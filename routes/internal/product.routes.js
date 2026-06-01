import express from "express";

import { productController } from "../../controllers/product.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import { 
  createProductSchema,
  updateProductOptionGroupSchema 
} from "../../contracts/input/product.schema.js";

const productRouter = express.Router();

/**
 * @route   POST /api/v1/internal/products
 * @desc    Tạo mới sản phẩm (Product)
 */
productRouter.post(
  "/",
  protect,
  restrictTo("ADMIN", "MANAGER"),
  validateData(createProductSchema),
  productController.createProduct,
);

/**
 * @route   PUT /api/v1/internal/products/:id/option-groups/:optionGroupId
 * @desc    Cập nhật Option Group của Product
 */
productRouter.put(
  "/:id/option-groups/:optionGroupId",
  protect,
  restrictTo("ADMIN", "MANAGER"),
  validateData(updateProductOptionGroupSchema),
  productController.updateProductOptionGroup,
);

export default productRouter;
