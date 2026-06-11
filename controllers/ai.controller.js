import { aiService } from "../services/ai.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { sanitizeDecimal } from "../lib/decimalHelper.js";

export const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  const result = await aiService.generateChatResponse(messages);

  const sanitizedResult = sanitizeDecimal({
    text: result.text,
    toolResults: result.toolResults,
  });

  return res.ok(
    sanitizedResult,
    "AI response generated successfully",
  );
});
