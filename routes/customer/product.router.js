import express from "express";
import { customerProductController } from "../../config/di.config.js";

const customerProductRouter = express.Router();

// Customer product endpoints
// GET /api/v1/products - Get product list
// GET /api/v1/stores - Get nearby stores

customerProductRouter.get("/", customerProductController.getProducts);
customerProductRouter.get("/stores", customerProductController.getNearbyStores);

export default customerProductRouter;
