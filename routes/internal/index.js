import express from "express";
import orderRouter from "./order.routes.js";
import authRouter from "./auth.routes.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { protect } from "../../middlewares/authentication.middleware.js";

const internalRouter = express.Router();
// internalRouter.use(restrictTo("STAFF", "CASHIER", "MANAGER", "ADMIN"));
// internalRouter.use(protect);

internalRouter.use("/admin", (_, res) => {
  res.json({ message: "Admin route" });
});

// Mount staff order routes
internalRouter.use("/orders",orderRouter);
internalRouter.use("/auth", authRouter);


export default internalRouter;