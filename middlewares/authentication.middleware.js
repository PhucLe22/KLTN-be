import { verifyAccessToken } from "../config/jwt.config.js";
import { UnauthorizedException } from "../controllers/error.controller.js";

export function authenticationMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer "))
    throw new UnauthorizedException("You need to login to access this feature!");

  try {
    req.user = verifyAccessToken(authHeader.split(" ")[1]);
    next();
  } catch (err) {
    throw new UnauthorizedException(
      err.name === "TokenExpiredError"
        ? "Your session has expired, please login again."
        : "Authentication failed."
    );
  }
}
