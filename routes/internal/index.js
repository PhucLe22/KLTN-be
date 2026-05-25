import express from "express";
import orderRouter from "./order.routes.js";
import authRouter from "./auth.routes.js";
import adminRouter from "./admin.routes.js";
import productRouter from "./product.routes.js";
import optionGroupRouter from "./option-group.routes.js";

const internalRouter = express.Router();

// Mount staff order routes
internalRouter.use("/orders",orderRouter);
internalRouter.use("/auth", authRouter);
internalRouter.use("/admin", adminRouter);
internalRouter.use("/products", productRouter);
internalRouter.use("/option-groups", optionGroupRouter);

export default internalRouter;