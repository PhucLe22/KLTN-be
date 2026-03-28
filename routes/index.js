import express from "express";
import authRouter from "./auth.router.js";

// Customer routes
import customerOrderRouter from "./customer/order.router.js";
import customerProductRouter from "./customer/product.router.js";

// Staff routes
import staffOrderRouter from "./staff/order.router.js";
import staffProductRouter from "./staff/product.router.js";
import staffDeliveryRouter from "./staff/delivery.router.js";

// Admin routes
import adminStoreRouter from "./admin/store.router.js";
import adminStaffRouter from "./admin/staff.router.js";
import adminReportRouter from "./admin/report.router.js";

const router = express.Router();


router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodApp API is running",
  });
});

// Auth routes
router.use("/auth", authRouter);

// Customer routes
router.use("/orders", customerOrderRouter);
router.use("/products", customerProductRouter);

// Staff routes
router.use("/staff/orders", staffOrderRouter);
router.use("/staff/products", staffProductRouter);
router.use("/staff/deliveries", staffDeliveryRouter);

// Admin routes
router.use("/admin/stores", adminStoreRouter);
router.use("/admin/staffs", adminStaffRouter);
router.use("/admin/reports", adminReportRouter);

export default router;