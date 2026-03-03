import { UnauthorizedException, ForbiddenException } from "../controllers/error.controller.js";

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user)
      throw new UnauthorizedException("You need to login to access this feature!");

    if (!allowedRoles.includes(req.user.role))
      throw new ForbiddenException("You do not have permission to access this feature!");

    next();
  };
}
