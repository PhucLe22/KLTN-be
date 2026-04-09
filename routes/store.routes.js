import express from "express";
import { storeController } from "../controllers/store.controller.js";

const storeRouter = express.Router();

/**
 * @route   GET /api/v1/stores
 * @desc    Lấy danh sách cửa hàng
 * @access  Public
 */
storeRouter.get("/", storeController.getAllStores);

export default storeRouter;