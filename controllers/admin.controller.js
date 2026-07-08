import { kitchenService } from "../services/kitchen.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { AdminShipperRoutesMap } from "../contracts/output/admin/shipper-route.output.schema.js";

class AdminController {
  getAllShipperRoutes = asyncHandler(async (req, res) => {
    const forceRefresh = req.method === 'POST';
    const shipperId = req.query?.shipperId || null;
    const { formattedOrders, ...schedule } = await kitchenService.getDeliverySchedule(null, forceRefresh, shipperId);
    const result = mapper(schedule, AdminShipperRoutesMap);
    return res.ok(result);
  });
}

export const adminController = new AdminController();
