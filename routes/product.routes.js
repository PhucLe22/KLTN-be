import express from "express";
import { productController } from "../controllers/product.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { getProductsSchema as inputGetProductsSchema } from "../contracts/input/product.schema.js";

const productRouter = express.Router();


/**
 * @route   GET /api/v1/products
 * @desc    Lấy danh sách sản phẩm
 * @access  Public
 */
productRouter.get(
  "/",
  validateData({ query: inputGetProductsSchema.query }),
  productController.getAllProducts,
);

// /**
//  * @route   GET /api/v1/product/:slug
//  * @desc    Lấy sản phẩm theo slug
//  * @access  Public
//  */
// productRouter.get(
//   "/:slug",
//   validateData({ params: inputGetProductBySlugSchema.params }),
//   productController.getProductBySlug,
// );

export default productRouter;