import { z } from "zod";
import * as f from "../common.schema.js";
export const registerInputSchema = z.object({
  type: f.userType,
});
