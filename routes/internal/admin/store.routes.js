import express from "express";
import { storeController } from "../../../controllers/store.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { 
  createStores, 
  updateStores, 
  deleteStores 
} from "../../../contracts/input/store.schema.js";
import { protect } from "../../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../../constants/enum.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo(StaffRole.ADMIN));

/**
 * @route   GET /api/v1/internal/admin/stores
 * @desc    Lấy danh sách cửa hàng
 */
router.get("/", storeController.list);

/**
 * @route   POST /api/v1/internal/admin/stores
 * @desc    Tạo cửa hàng mới
 */
router.post(
  "/",
  validate(createStores),
  storeController.create
);

/**
 * @route   PUT /api/v1/internal/admin/stores/:id
 * @desc    Cập nhật cửa hàng
 */
router.put(
  "/:id",
  validate(updateStores),
  storeController.update
);

/**
 * @route   DELETE /api/v1/internal/admin/stores/:id
 * @desc    Xóa cửa hàng
 */
router.delete(
  "/:id",
  validate(deleteStores),
  storeController.remove
);

export default router;
