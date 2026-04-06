import express from "express";
import { productController } from "../controllers/product.controller.js";

const productRouter = express.Router();


/**
 * @route   GET /api/v1/products
 * @desc    Lấy danh sách sản phẩm
 * @access  Public
 */
productRouter.get("/", productController.getAllProducts);

export default productRouter;