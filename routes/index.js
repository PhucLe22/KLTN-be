import express from "express";
import authRouter from "./auth.routes.js";
import productRouter from "./product.routes.js";
import storeRouter from "./store.routes.js";
import orderRouter from "./order.routes.js";
import internalRouter from "./internal/index.js";
import categoryRouter from "./category.routes.js";
import promotionRouter from "./promotion.routes.js";
import addressRouter from "./address.routes.js";
import aiRouter from "./ai.routes.js";

const mainRouter = express.Router();

/**
 * Kiểm tra trạng thái Server
 */
mainRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

/**
 * MODULE ROUTES
 * Mount các domain routes vào đây
 */
mainRouter.use("/auth", authRouter);
mainRouter.use("/products", productRouter);
mainRouter.use("/stores", storeRouter);
mainRouter.use("/orders", orderRouter);
mainRouter.use("/internal", internalRouter);
mainRouter.use("/categories", categoryRouter);
mainRouter.use("/promotions", promotionRouter);
mainRouter.use("/ai", aiRouter);
mainRouter.use("/addresses", addressRouter);

export default mainRouter;
