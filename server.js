import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/connectDB.config.js";
import mainRouter from "./routes/index.js";
import { exceptionFilter } from "./controllers/error.controller.js";

// Load environment variables
dotenv.config({ path: ".env" });
const app = express();
// Logger
app.use(morgan("dev"));
// Connect to database
connectDB();
// Middleware
app.use(express.json());

// Routes

app.use("/api/v1", mainRouter);

// Global exception filter
app.use(exceptionFilter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});