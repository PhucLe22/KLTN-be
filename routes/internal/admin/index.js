import express from "express";
import storeRouter from "./store.routes.js";
import userRouter from "./user.routes.js";
import productRouter from "./product.routes.js";
import categoryRouter from "./category.routes.js";
import shipperRouteRouter from "./shipper-route.routes.js";

const adminRouter = express.Router();

adminRouter.use("/stores", storeRouter);
adminRouter.use("/users", userRouter);
adminRouter.use("/products", productRouter);
adminRouter.use("/categories", categoryRouter);
adminRouter.use("/shipper-routes", shipperRouteRouter);

export default adminRouter;
