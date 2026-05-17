import express from "express";

import { productController } from "../../controllers/product.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import { createProductSchema } from "../../contracts/input/product.schema.js";

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

export default productRouter;
