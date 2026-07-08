import express from "express";
import { productController } from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { 
  getProducts,
  getProductBySlug
} from "../contracts/input/product.schema.js";

const productRouter = express.Router();


/**
 * @route   GET /api/v1/products
 * @desc    Lấy danh sách sản phẩm
 * @access  Public
 */
productRouter.get(
  "/",
  validate(getProducts),
  productController.list,
);

/**
 * @route   GET /api/v1/products/:slug
 * @desc    Lấy sản phẩm theo slug
 * @access  Public
 */
productRouter.get(
  "/:slug",
  validate(getProductBySlug),
  productController.show,
);

export default productRouter;