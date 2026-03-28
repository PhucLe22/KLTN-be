import express from "express";
import { authController } from "../config/di.config.js"; 
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";
const authRouter = express.Router();

// Dont need to create new instance, use authController from DI
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", authenticationMiddleware, authController.getProfile);

export default authRouter;