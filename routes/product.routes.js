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
 * @route   GET /api/v1/products/search
 * @desc    Tìm kiếm sản phẩm theo tên (cho ô search)
 * @access  Public
 */
productRouter.get(
  "/search",
  productController.search,
);

/**
 * @route   GET /api/v1/products/new
 * @desc    Lấy sản phẩm mới nhất
 * @access  Public
 */
productRouter.get(
  "/new",
  productController.listNew,
);

/**
 * @route   GET /api/v1/products/hot
 * @desc    Lấy sản phẩm bán chạy
 * @access  Public
 */
productRouter.get(
  "/hot",
  productController.listHot,
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