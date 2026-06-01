import { BaseController } from "./base.controller.js";
import { kitchenService } from "../services/kitchen.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";

class KitchenController extends BaseController {
  constructor() {
    super(kitchenService);
  }

  getSchedule = asyncHandler(async (req, res) => {
    const storeId = req.user.staff.storeId;
    const { tardiness_weight } = req.body;

    const result = await this.service.getSchedule(storeId, tardiness_weight);

    return this.success(res, {
      data: result,
    });
  });
}

export const kitchenController = new KitchenController();
