import express from "express";
import orderRouter from "./order.routes.internal.js";

const internalRouter = express.Router();

import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { protect } from "../../middlewares/authentication.middleware.js";

internalRouter.use("/admin", (_, res) => {
  res.json({ message: "Admin route" });
});

// Mount staff order routes
internalRouter.use("/orders",orderRouter);


export default internalRouter;