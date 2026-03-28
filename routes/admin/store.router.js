import express from "express";
import { adminStoreController } from "../../config/di.config.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";

const adminStoreRouter = express.Router();

// Admin store management endpoints - require admin role
adminStoreRouter.use(authenticationMiddleware, authorize("admin"));

// CRUD for stores
adminStoreRouter.get("/", adminStoreController.getAllStores);
adminStoreRouter.post("/", adminStoreController.createStore);
adminStoreRouter.get("/:id", adminStoreController.getStoreById);
adminStoreRouter.put("/:id", adminStoreController.updateStore);
adminStoreRouter.delete("/:id", adminStoreController.deleteStore);

export default adminStoreRouter;
