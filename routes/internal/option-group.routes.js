import express from "express";

import { optionGroupController } from "../../controllers/option-group.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import { createOptionGroupSchema } from "../../contracts/input/option.schema.js";

const optionGroupRouter = express.Router();

/**
 * @route   POST /api/v1/internal/option-groups
 * @desc    Tạo mới Option Group cùng với các Product Options
 */
optionGroupRouter.post(
  "/",
  protect,
  restrictTo("ADMIN", "MANAGER"),
  validateData(createOptionGroupSchema),
  optionGroupController.createOptionGroup,
);

export default optionGroupRouter;
