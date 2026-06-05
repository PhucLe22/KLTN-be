import express from "express";
import { productController } from "../controllers/product.controller.js";

const catalogRouter = express.Router();

catalogRouter.get("/", productController.list);

export default catalogRouter;