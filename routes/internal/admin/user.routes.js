import express from "express";
import { userController } from "../../../controllers/user.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { 
  getUsers, 
  updateUser, 
  deleteUser 
} from "../../../contracts/input/user.schema.js";
import { protect } from "../../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../../constants/enum.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo(StaffRole.ADMIN));

/**
 * @route   GET /api/v1/internal/admin/users
 * @desc    Lấy danh sách người dùng
 */
router.get("/", validate(getUsers), userController.list);

/**
 * @route   PUT /api/v1/internal/admin/users/:id
 * @desc    Cập nhật người dùng
 */
router.put(
  "/:id",
  validate(updateUser),
  userController.update
);

/**
 * @route   DELETE /api/v1/internal/admin/users/:id
 * @desc    Xóa người dùng
 */
router.delete(
  "/:id",
  validate(deleteUser),
  userController.remove
);

export default router;
