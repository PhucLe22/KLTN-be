import { customerService } from "../services/customer.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";

class CustomerController {
  search = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.ok([]);
    }
    const customers = await customerService.search(query);
    return res.ok(customers);
  });
}

export const customerController = new CustomerController();
