import pkg from "@prisma/client/index-browser.js";
import { UserType } from "../constants/enum.js";
import { z } from "zod";
import { VALIDATION_MESSAGES } from "../constants/errors.js";
const { CustomerTier, StaffRole } = pkg;

// Các field cơ bản
export const id = z.uuid(VALIDATION_MESSAGES.ID_INVALID);
export const name = z
  .string()
  .min(2, VALIDATION_MESSAGES.NAME_MIN)
  .max(40, VALIDATION_MESSAGES.NAME_MAX);
export const email = z.email(VALIDATION_MESSAGES.EMAIL_INVALID);
export const phone = z
  .string()
  .regex(/^[0-9]{10,11}$/, VALIDATION_MESSAGES.PHONE_INVALID);
export const password = z.string().min(6, VALIDATION_MESSAGES.PASSWORD_MIN);

// Các field đặc thù nghiệp vụ
export const tier = z.enum(CustomerTier).default(CustomerTier.BRONZE);
export const points = z
  .number(VALIDATION_MESSAGES.POINTS_INVALID)
  .nonnegative(VALIDATION_MESSAGES.POINTS_NON_NEGATIVE)
  .default(0);
export const role = z.enum(StaffRole);
export const userType = z.enum(UserType);

// Tokens
export const token = z.string(VALIDATION_MESSAGES.TOKEN_REQUIRED);
