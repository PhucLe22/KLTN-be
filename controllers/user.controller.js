import { BaseController } from "./base.controller.js";
import { userService } from "../services/user.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { UserMapper } from "../mappers/user.mapper.js";

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

    getAllUsers = asyncHandler(async (req, res) => {
        const result = await this.service.findAll(req.query);
        const formattedItems = UserMapper.toGetAllUsersResponse(result.items);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formattedItems,
            meta: result.meta
        });
    });

    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        const result = await this.service.updateUser(id, body);
        const formatted = UserMapper.toUpdateUserResponse(result);

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });

    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await this.service.deleteUser(id);
        const formatted = UserMapper.toDeleteUserResponse();

        return this.success(res, {
            statusCode: SUCCESS_STATUS_CODE.OK,
            message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
            data: formatted
        });
    });
}

export const userController = new UserController();