import { ForbiddenException } from "../lib/httpExceptions.js";
import { UserType } from "../constants/enum.js";

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (
      !roles.includes(req.user.staff?.role) &&
      !roles.includes(UserType.CUSTOMER)
    ) {
      console.log("User staff role:", req.user.staff?.role);
      throw new ForbiddenException();
    }
   
    next();
  };
};
