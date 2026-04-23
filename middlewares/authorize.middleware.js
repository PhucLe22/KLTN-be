import { ForbiddenException } from "../lib/httpExceptions.js";
import { UserType } from "../constants/enum.js";
import { VALIDATION_MESSAGES } from "../constants/errors.js";

export const restrictTo = (...roles) => {
  return (req, next) => {
    if (
      !roles.includes(req.user.staff?.role) &&
      !roles.includes(UserType.CUSTOMER)
    ) {
      throw new ForbiddenException();
    }
    next();
  };
};
