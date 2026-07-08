import express from "express";
import { adminController } from "../../../controllers/admin.controller.js";
import { protect } from "../../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../../constants/enum.js";

const router = express.Router();
router.use(protect);
router.use(restrictTo(StaffRole.ADMIN, StaffRole.OWNER));

router.route("/")
  .get(adminController.getAllShipperRoutes)
  .post(adminController.getAllShipperRoutes);

export default router;
