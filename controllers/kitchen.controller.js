import { kitchenService } from "../services/kitchen.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";

class KitchenController {
  getSchedule = asyncHandler(async (req, res) => {
    const storeId = req.user.staff.storeId;
    const { tardiness_weight } = req.body;

    const schedule = await kitchenService.getSchedule(storeId, tardiness_weight);

    return res.ok(schedule);
  });
}

export const kitchenController = new KitchenController();
