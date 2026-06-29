import express from "express";
import { productController } from "../../../controllers/product.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../../contracts/input/product.schema.js";
import { getAdminProducts } from "../../../contracts/input/admin/product.input.schema.js";
import { protect } from "../../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../../constants/enum.js";

import { uploadSingleImage } from "../../../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

// /api/v1/internal/admin/products
router.get(
  "/",
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  validate(getAdminProducts),
  productController.list
);

// /api/v1/internal/admin/products
router.post(
  "/", 
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  uploadSingleImage("image"),
  validate(createProduct), 
  productController.create
);

// /api/v1/internal/admin/products/:id
router.put(
  "/:id",
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  uploadSingleImage("image"),
  validate(updateProduct),
  productController.update
);

// /api/v1/internal/admin/products/:id/toggle-active
router.patch(
  "/:id/toggle-active",
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  validate(deleteProduct),
  productController.toggleActive
);

// /api/v1/internal/admin/products/:id
router.delete(
  "/:id",
  restrictTo(StaffRole.ADMIN),
  validate(deleteProduct),
  productController.remove
);

export default router;
