import { staffService } from "../services/staff.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { StaffMap } from "../contracts/output/staff/staff.output.schema.js";

class StaffController {
    list = asyncHandler(async (req, res) => {
        const staffs = await staffService.findAll(req.query);
        const result = mapper(staffs.items, StaffMap);
        return res.ok(result, staffs.meta);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const staff = await staffService.update(id, req.body);
        const result = mapper(staff, StaffMap);
        return res.ok(result);
    });

    remove = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await staffService.remove(id);
        return res.ok();
    });

    removeHard = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await staffService.removeHard(id);
        return res.ok();
    });
}

export const staffController = new StaffController();
