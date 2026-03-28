import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import morgan from "morgan";
import mainRouter from "./routes/index.js";
import { exceptionFilter } from "./controllers/error.controller.js";
import { prisma } from "./config/di.config.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/v1", mainRouter);

// Global error handler
app.use(exceptionFilter);

const PORT = process.env.PORT || 3000;
prisma.$connect()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });