import express from "express";

import { productController } from "../../controllers/product.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import { 
  createProduct,
  updateProduct,
  updateProductOptionGroup,
  deleteProduct
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
 * @route   PUT /api/v1/internal/products/:id
 * @desc    Cập nhật thông tin sản phẩm (Product)
 */
productRouter.put(
  "/:id",
  protect,
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  uploadSingleImage("image"),
  validate(updateProduct),
  productController.update,
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

/**
 * @route   PATCH /api/v1/internal/products/:id/toggle-active
 * @desc    Bật/tắt trạng thái sản phẩm (Product)
 */
productRouter.patch(
  "/:id/toggle-active",
  protect,
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  validate(deleteProduct),
  productController.toggleActive,
);

/**
 * @route   DELETE /api/v1/internal/products/:id
 * @desc    Xóa sản phẩm (Product) - ADMIN only
 */
productRouter.delete(
  "/:id",
  protect,
  restrictTo(StaffRole.ADMIN),
  validate(deleteProduct),
  productController.remove,
);

export default productRouter;
