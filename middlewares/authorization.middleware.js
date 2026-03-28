import { UnauthorizedException, ForbiddenException } from "../controllers/error.controller.js";
import { UserEntity } from "../models/user.model.js";

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user)
      throw new UnauthorizedException("You need to login to access this feature!");

    const user = await UserEntity.findByPk(req.user.sub);
    if (!user)
      throw new UnauthorizedException("User no longer exists.");

    if (!allowedRoles.includes(req.user.role))
      throw new ForbiddenException("You do not have permission to access this feature!");

    next();
  };
}
