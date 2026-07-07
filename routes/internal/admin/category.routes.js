import express from "express";
import { categoryController } from "../../../controllers/category.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryBySlug
} from "../../../contracts/input/category.schema.js";
import { protect } from "../../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../../constants/enum.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo(StaffRole.ADMIN));

/**
 * @route   GET /api/v1/internal/admin/categories
 */
router.get("/", validate(getCategories), categoryController.list);

/**
 * @route   GET /api/v1/internal/admin/categories/:slug
 */
router.get("/:slug", validate(getCategoryBySlug), categoryController.show);

/**
 * @route   POST /api/v1/internal/admin/categories
 */
router.post("/", validate(createCategory), categoryController.create);

/**
 * @route   PUT /api/v1/internal/admin/categories/:id
 */
router.put(
  "/:id",
  validate(updateCategory),
  categoryController.update
);

/**
 * @route   DELETE /api/v1/internal/admin/categories/:id
 */
router.delete(
  "/:id",
  validate(deleteCategory),
  categoryController.remove
);

export default router;
