import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import * as f from "../common.schema.js";

// 1. GET /api/v1/ship/matrix
export const getDistanceMatrix = {
  query: z.object({
    // Danh sách các tọa độ điểm giao hàng, cách nhau bằng dấu phẩy
    // Ví dụ: "10.1,106.1|10.2,106.2"
    locations: z.string().min(1, VALIDATION_MESSAGES.LOCATIONS_REQUIRED),
    mode: z.enum(["driving", "walking", "cycling"]).default("driving"),
  }),
};

// 2. POST /api/v1/ship/optimize-route
export const optimizeRoute = {
  body: z.object({
    orderIds: z
      .array(f.id)
      .min(1, VALIDATION_MESSAGES.ORDERS_REQUIRED),

    // Năng suất của nhân viên (ví dụ: tối đa 5 đơn/chuyến)
    staffCapacity: z.number().int().positive().default(5),

    // Cửa sổ thời gian (Time Windows) cho việc giao hàng
    timeWindows: z.object({
      startTime: z.string().datetime(), // ISO string
      endTime: z.string().datetime(),
      maxServiceTime: z
        .number()
        .describe("Thời gian xử lý tại mỗi điểm (phút)"),
    }),

    // Tọa độ kho (Store) bắt đầu xuất phát
    depotLocation: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
};

// 3. GET /api/v1/ship/schedule/:staff_id
export const getStaffSchedule = {
  params: z.object({
    staff_id: f.id,
  }),
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.DATE_FORMAT_INVALID)
      .optional(),
  }),
};
