import express from "express";
import { productController } from "../controllers/product.controller.js";

const catalogRouter = express.Router();

catalogRouter.get("/", productController.getAllProducts);

export default catalogRouter;