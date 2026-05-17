import { ForbiddenException } from "../lib/httpExceptions.js";
import { UserType } from "../constants/enum.js";
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // If no user is authenticated, check if CUSTOMER is allowed
    // console.log("req.user", req.user);
    if (!req.user) {
      throw new ForbiddenException();
    }

    // If user is authenticated, check their role
    if (
      !roles.includes(req.user.staff?.role) &&
      !roles.includes(UserType.CUSTOMER)
    ) {
      throw new ForbiddenException();
    }
    next();
  };
};
