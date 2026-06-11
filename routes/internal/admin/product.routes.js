import express from "express";
import { productController } from "../../../controllers/product.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../../contracts/input/product.schema.js";
import { protect } from "../../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../../constants/enum.js";

import { uploadSingleImage } from "../../../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo(StaffRole.ADMIN));

// /api/v1/internal/admin/products
router.get("/", validate(getProducts), productController.list);

// /api/v1/internal/admin/products
router.post(
  "/", 
  uploadSingleImage("image"),
  validate(createProduct), 
  productController.create
);

// /api/v1/internal/admin/products/:id
router.put(
  "/:id",
  uploadSingleImage("image"),
  validate(updateProduct),
  productController.update
);
// /api/v1/internal/admin/products/:id
router.delete(
  "/:id",
  validate(deleteProduct),
  productController.remove
);

export default router;
