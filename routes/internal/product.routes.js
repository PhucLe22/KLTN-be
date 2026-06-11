import express from "express";

import { productController } from "../../controllers/product.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import { 
  createProduct,
  updateProductOptionGroup 
} from "../../contracts/input/product.schema.js";

const productRouter = express.Router();

/**
 * @route   POST /api/v1/internal/products
 * @desc    Tạo mới sản phẩm (Product)
 */
productRouter.post(
  "/",
  protect,
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  uploadSingleImage("image"),
  validate(createProduct),
  productController.create,
);

/**
 * @route   PUT /api/v1/internal/products/:id/option-groups/:optionGroupId
 * @desc    Cập nhật Option Group của Product
 */
productRouter.put(
  "/:id/option-groups/:optionGroupId",
  protect,
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  validate(updateProductOptionGroup),
  productController.updateOptionGroup,
);

export default productRouter;
