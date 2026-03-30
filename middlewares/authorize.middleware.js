import { ForbiddenException } from "../lib/httpExceptions";
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.staff?.role) && !roles.includes("CUSTOMER")) {
      throw new ForbiddenException(
        "Bạn không có quyền thực hiện hành động này.",
      );
    }
    next();
  };
};
