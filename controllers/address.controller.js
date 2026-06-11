import { addressService } from "../services/address.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";

class AddressController {
  create = asyncHandler(async (req, res) => {
    const address = await addressService.create(req.body);
    return res.ok(address);
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const address = await addressService.update(id, req.body);
    return res.ok(address);
  });

  setDefault = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const address = await addressService.setDefault(id);
    return res.ok(address);
  });

  listByCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const addresses = await addressService.findByCustomer(customerId);
    return res.ok(addresses);
  });

  listByStore = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const addresses = await addressService.findByStore(storeId);
    return res.ok(addresses);
  });

  remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await addressService.delete(id);
    return res.ok();
  });
}

export const addressController = new AddressController();
