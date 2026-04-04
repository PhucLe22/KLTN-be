import { ForbiddenException } from "../lib/httpExceptions";
import { UserType } from "../constants/enum";
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (
      !roles.includes(req.user.staff?.role) &&
      !roles.includes(UserType.CUSTOMER)
    ) {
      throw new ForbiddenException();
    }
    next();
  };
};
