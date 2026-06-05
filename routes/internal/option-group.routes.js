import express from "express";

import { optionGroupController } from "../../controllers/option-group.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import { createOptionGroup } from "../../contracts/input/option.schema.js";

const optionGroupRouter = express.Router();

/**
 * @route   POST /api/v1/internal/option-groups
 * @desc    Tạo mới Option Group cùng với các Product Options
 */
optionGroupRouter.post(
  "/",
  protect,
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  validate(createOptionGroup),
  optionGroupController.createOptionGroup,
);

export default optionGroupRouter;
