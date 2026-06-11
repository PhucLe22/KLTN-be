import { kitchenService } from "../services/kitchen.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";

class KitchenController {
  getSchedule = asyncHandler(async (req, res) => {
    const storeId = req.user.staff.storeId;
    const { tardiness_weight } = req.body;

    const schedule = await kitchenService.getSchedule(storeId, tardiness_weight);

    return res.ok(schedule);
  });

  getDeliverySchedule = asyncHandler(async (req, res) => {
    const storeId = req.user.staff.storeId;
    const staffId = req.user.staff.id;
    const role = req.user.staff.role;
    
    // Use cache only for GET requests
    const useCache = req.method === 'GET';

    // If SHIPPER, only get their own schedule
    const shipperId = role === 'SHIPPER' ? staffId : null;

    const schedule = await kitchenService.getDeliverySchedule(storeId, !useCache, shipperId);

    return res.ok(schedule);
  });

}

export const kitchenController = new KitchenController();
