import { ERR } from "../lib/httpExceptions.js";
import { StaffRole, UserType } from "../constants/enum.js";

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ERR.Forbidden();
    }

    const hasStaffRole = Boolean(req.user.staff?.role);
    const staffRole = req.user.staff?.role;

    // Allow any staff when UserType.STAFF is requested.
    if (hasStaffRole && roles.includes(UserType.STAFF)) {
      return next();
    }

    // Allow specific staff roles.
    if (hasStaffRole && staffRole && roles.includes(staffRole)) {
      return next();
    }

    // Allow customers explicitly if the role list includes CUSTOMER.
    if (!hasStaffRole && roles.includes(UserType.CUSTOMER)) {
      return next();
    }

    throw ERR.Forbidden();
  };
};
