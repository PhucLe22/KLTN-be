import express from "express";
import { storeController } from "../controllers/store.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getStores } from "../contracts/input/store.schema.js";

const storeRouter = express.Router();

/**
 * @route   GET /api/v1/stores
 * @desc    Lấy danh sách cửa hàng
 * @access  Public
 */
storeRouter.get(
  "/",
  validate(getStores),
  storeController.list,
);

export default storeRouter;