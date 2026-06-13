import { kitchenService } from "../services/kitchen.service.js";
import { storeService } from "../services/store.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { StaffRole } from "../constants/enum.js";

class KitchenController {
  getSchedule = asyncHandler(async (req, res) => {
    // Expecting array of storeIds, or default to user's store
    const storeIds = req.body?.storeIds || [req.user?.staff?.storeId];
    const { tardiness_weight } = req.body || {};

    const schedule = await kitchenService.getSchedule(storeIds, tardiness_weight);

    return res.ok(schedule);
  });

  getDeliverySchedule = asyncHandler(async (req, res) => {
    const staffId = req.user?.staff?.id;
    const role = req.user?.staff?.role;
    
    // If storeIds provided in query/body, use it.
    // If NOT provided:
    // - For SHIPPER: default to null (service will fetch all their orders regardless of store)
    // - For others: default to their own store
    let storeIds = req.query?.storeIds || req.body?.storeIds;
    if (!storeIds && role !== StaffRole.SHIPPER) {
      storeIds = [req.user?.staff?.storeId];
    }
    
    // Use cache only for GET requests
    const useCache = req.method === 'GET';

    // If SHIPPER, only get their own schedule
    const shipperId = role === StaffRole.SHIPPER ? staffId : null;

    const schedule = await kitchenService.getDeliverySchedule(storeIds, !useCache, shipperId);

    return res.ok(schedule);
  });

  solveNetwork = asyncHandler(async (req, res) => {
    const { tardiness_weight = 1000 } = req.body;

    // 1. Get ALL active store IDs via Service
    const storeIds = await storeService.getAllActiveStoreIds();

    if (storeIds.length === 0) {
      return res.ok({ message: "No active stores found to solve." });
    }

    // 2. Trigger global solve via Service
    const result = await kitchenService.getSchedule(storeIds, tardiness_weight);

    return res.ok({
      message: "Network-wide optimization completed.",
      storesProcessed: storeIds.length,
      ...result
    });
  });

}

export const kitchenController = new KitchenController();
