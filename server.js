import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import mainRouter from "./routes/index.js";
import connectToDB from "./config/connectToDB.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import logger from "./lib/logger.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectToDB();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms"),
);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use("/api/v1", mainRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
