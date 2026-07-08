import { addressService } from "../services/address.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { AddressMap } from "../contracts/output/address.output.schema.js";
import { ERR } from "../lib/httpExceptions.js";

class AddressController {
  create = asyncHandler(async (req, res) => {
    const data = { ...req.body };

    // If user is a customer, force their own customerId and prevent setting storeId
    if (req.user?.customer?.id) {
      data.customerId = req.user.customer.id;
      delete data.storeId;
    }
    // If user is staff/admin and didn't provide any ID, default to their store if applicable
    else if (req.user?.staff && !data.customerId && !data.storeId) {
      data.storeId = req.user.staff.storeId;
    }

    const address = await addressService.create(data);
    const result = mapper(address, AddressMap);
    return res.ok(result);
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Ownership check for customers
    if (req.user?.customer?.id) {
      const existingAddress = await addressService.findById(id);
      if (
        existingAddress?.customerId &&
        existingAddress.customerId !== req.user.customer.id
      ) {
        throw new Error("You do not have permission to update this address");
      }
    }

    const address = await addressService.update(id, req.body);
    const result = mapper(address, AddressMap);
    return res.ok(result);
  });

  setDefault = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Ownership check for customers
    if (req.user?.customer?.id) {
      const existingAddress = await addressService.findById(id);
      if (
        existingAddress?.customerId &&
        existingAddress.customerId !== req.user.customer.id
      ) {
        throw new Error(
          "You do not have permission to set this address as default",
        );
      }
    }

    const address = await addressService.setDefault(id);
    const result = mapper(address, AddressMap);
    return res.ok(result);
  });

  listMine = asyncHandler(async (req, res) => {
    if (!req.user?.customer?.id) {
      return res.ok([]);
    }
    const addresses = await addressService.findByCustomer(req.user.customer.id);
    const result = mapper(addresses.items, AddressMap);
    return res.ok(result, addresses.meta);
  });

  listByCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const addresses = await addressService.findByCustomer(customerId);
    const result = mapper(addresses.items, AddressMap);
    return res.ok(result, addresses.meta);
  });

  listByStore = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const addresses = await addressService.findByStore(storeId);
    const result = mapper(addresses.items, AddressMap);
    return res.ok(result, addresses.meta);
  });

  autocomplete = asyncHandler(async (req, res) => {
    const { text, type, limit, lang } = req.query;
    if (!text || !text.trim()) return res.ok([]);
    const results = await addressService.autocomplete(text.trim(), { type, limit, lang });

    return res.ok(results);
  });

  remove = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existingAddress = await addressService.findById(id);
    if (!existingAddress) {
      throw ERR.NotFound("Address not found");
    }

    // Ownership check for customers
    if (req.user?.customer?.id) {
      if (
        existingAddress.customerId &&
        existingAddress.customerId !== req.user.customer.id
      ) {
        throw ERR.Forbidden("You do not have permission to delete this address");
      }
    }

    await addressService.delete(id);
    return res.ok();
  });
}

export const addressController = new AddressController();
