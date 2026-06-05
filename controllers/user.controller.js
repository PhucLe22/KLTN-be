import { userService } from "../services/user.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { UserMap } from "../contracts/output/user.output.schema.js";

class UserController {
    list = asyncHandler(async (req, res) => {
        const users = await userService.findAll(req.query);
        const result = mapper(users.items, UserMap);

        return res.ok(result, users.meta);
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        const user = await userService.update(id, body);
        const result = mapper(user, UserMap);

        return res.ok(result);
    });

    remove = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await userService.remove(id);

        return res.ok();
    });
}

export const userController = new UserController();
