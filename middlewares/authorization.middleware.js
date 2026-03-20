import { UnauthorizedException, ForbiddenException } from "../controllers/error.controller.js";
import User from "../models/user.model.js"; // adjust to your actual path

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user)
      throw new UnauthorizedException("You need to login to access this feature!");

    const user = await User.findByPk(req.user.sub);
    if (!user)
      throw new UnauthorizedException("User no longer exists.");

    if (!allowedRoles.includes(req.user.role))
      throw new ForbiddenException("You do not have permission to access this feature!");

    next();
  };
}
