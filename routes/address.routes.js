import express from "express";
import { addressController } from "../controllers/address.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { 
  createAddressSchema, 
  updateAddressSchema, 
  setDefaultAddressSchema 
} from "../contracts/input/address.schema.js";
import { protect } from "../middlewares/authentication.middleware.js";

const addressRouter = express.Router();

addressRouter.post("/", protect, validate(createAddressSchema), addressController.create);
addressRouter.put("/:id", protect, validate(updateAddressSchema), addressController.update);
addressRouter.patch("/:id/default", protect, validate(setDefaultAddressSchema), addressController.setDefault);
addressRouter.delete("/:id", protect, addressController.remove);
addressRouter.get("/customer/:customerId", protect, addressController.listByCustomer);
addressRouter.get("/store/:storeId", protect, addressController.listByStore);

export default addressRouter;
