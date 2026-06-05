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
export const optionalEmail = email.optional().nullable();
export const phone = z
  .string()
  .regex(/^[0-9]{10,11}$/, VALIDATION_MESSAGES.PHONE_INVALID);
export const optionalPhone = phone.optional().nullable();
export const password = z.string().min(6, VALIDATION_MESSAGES.PASSWORD_MIN);

// Các field đặc thù nghiệp vụ
export const tier = z.enum(CustomerTier).default(CustomerTier.BRONZE);
export const points = z
  .number(VALIDATION_MESSAGES.POINTS_INVALID)
  .nonnegative(VALIDATION_MESSAGES.POINTS_NON_NEGATIVE)
  .default(0);
export const role = z.enum(StaffRole);
export const userType = z.enum(UserType);

// Location & Contact fields (common across system)
export const address = z.string().min(10, VALIDATION_MESSAGES.ADDRESS_MIN);
export const lat = z.number().optional();
export const lng = z.number().optional();
export const hotline = z.string().regex(/^[0-9]{10}$/, VALIDATION_MESSAGES.HOTLINE_INVALID);

// Tokens
export const token = z.string(VALIDATION_MESSAGES.TOKEN_REQUIRED);
