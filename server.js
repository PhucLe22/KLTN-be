import dotenv from "dotenv";
dotenv.config({ path: ".env" });


import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mainRouter from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import logger from "./lib/logger.js";
import {  useCors } from "./config/cors.js";
import {  responseEnhancer } from "./middlewares/response.middleware.js";


const app = express();
const PORT = process.env.PORT || 5001;


app.use(cookieParser());
app.use(useCors);
app.use(express.json());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(responseEnhancer);
app.use("/api/v1", mainRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
