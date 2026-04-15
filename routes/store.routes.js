import express from "express";
import { storeController } from "../controllers/store.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { getStoresSchema as inputGetStoresSchema } from "../contracts/input/store.schema.js";

const storeRouter = express.Router();

/**
 * @route   GET /api/v1/stores
 * @desc    Lấy danh sách cửa hàng
 * @access  Public
 */
storeRouter.get(
  "/",
  validateData({ query: inputGetStoresSchema.query }),
  storeController.getAllStores,
);

export default storeRouter;