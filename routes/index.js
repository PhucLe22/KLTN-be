import express from "express";
import authRouter from "./auth.routes.js";
import productRouter from "./product.routes.js";

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
// mainRouter.use("/orders", orderRouter);

export default mainRouter;
