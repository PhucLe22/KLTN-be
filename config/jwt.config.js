import jwt from "jsonwebtoken";

function buildPayload(user = {}) {
  const { _id, ...rest } = user;
  return { sub: _id, ...rest, iss: "foodapp-api" };
}

export function generateAccessToken(user = {}) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET have not been configured");

  return jwt.sign(buildPayload(user), process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

export function generateRefreshToken(user = {}) {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET have not been configured");

  return jwt.sign(buildPayload(user), process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function decodeToken(token) {
  return jwt.decode(token);
}
