import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectToDB from "./config/connectToDB.js";
import { corsOptions } from "./config/cors.js";
import logger from "./lib/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import mainRouter from "./routes/index.js";

dotenv.config({ path: ".env" });

console.log("JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET);
console.log("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);
console.log("JWT_RESET_PASSWORD_SECRET", process.env.JWT_RESET_PASSWORD_SECRET);

const app = express();
const PORT = process.env.PORT || 5001;

connectToDB();

app.use(cookieParser());
app.use(cors(corsOptions));
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
