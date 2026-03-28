import express from "express";
import authRouter from "./auth.router.js";

const router = express.Router();


router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodApp API is running",
  });
});

router.use("/auth", authRouter);

export default router;