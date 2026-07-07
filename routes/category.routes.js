import { categoryController } from "../controllers/category.controller.js";
import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { getCategories } from "../contracts/input/category.schema.js";

const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  validate(getCategories),
  categoryController.list,
);

export default categoryRouter;
