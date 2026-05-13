import express from "express";
import orderRouter from "./order.routes.js";
import authRouter from "./auth.routes.js";
import adminRouter from "./admin.routes.js";

const internalRouter = express.Router();

// Mount staff order routes
internalRouter.use("/orders",orderRouter);
internalRouter.use("/auth", authRouter);
internalRouter.use("/admin", adminRouter);

export default internalRouter;