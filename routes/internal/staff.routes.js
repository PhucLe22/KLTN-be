import express from "express";
import { staffController } from "../../controllers/staff.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  updateStaff,
  getStaffs,
  deleteStaff,
} from "../../contracts/input/staff/staff.schema.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../constants/enum.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo(StaffRole.ADMIN, StaffRole.MANAGER));

router.get("/", validate(getStaffs), staffController.list);
router.put("/:id", validate(updateStaff), staffController.update);
router.delete("/:id", validate(deleteStaff), staffController.remove);
router.delete("/:id/hard", validate(deleteStaff), staffController.removeHard);

export default router;
