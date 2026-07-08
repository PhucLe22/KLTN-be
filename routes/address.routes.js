import express from "express";
import { addressController } from "../controllers/address.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { 
  createAddressSchema, 
  updateAddressSchema, 
  setDefaultAddressSchema 
} from "../contracts/input/address.schema.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { restrictTo } from "../middlewares/authorize.middleware.js";
import { StaffRole, UserType } from "../constants/enum.js";

const addressRouter = express.Router();

addressRouter.get("/", protect, addressController.listMine);
addressRouter.post("/", protect, validate(createAddressSchema), addressController.create);
addressRouter.get("/mine", protect, restrictTo(UserType.CUSTOMER), addressController.listMine);
addressRouter.put("/:id", protect, validate(updateAddressSchema), addressController.update);
addressRouter.patch("/:id/default", protect, validate(setDefaultAddressSchema), addressController.setDefault);
addressRouter.delete("/:id", protect, addressController.remove);

// Admin/Staff routes
addressRouter.get("/customer/:customerId", protect, restrictTo(StaffRole.ADMIN, StaffRole.OWNER, StaffRole.MANAGER), addressController.listByCustomer);
addressRouter.get("/store/:storeId", protect, restrictTo(StaffRole.ADMIN, StaffRole.OWNER, StaffRole.MANAGER), addressController.listByStore);

export default addressRouter;
