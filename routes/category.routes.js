import { categoryController } from "../controllers/category.controller.js";
import express from "express";
import { validateData } from "../middlewares/validate.middleware.js";
import { getCategoriesSchema } from "../contracts/input/category.schema.js";

const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  validateData({ query: getCategoriesSchema.query }),
  categoryController.getAllCategories,
);

export default categoryRouter;
