import { generateText, tool } from "ai";
import { aiModel } from "../lib/ai.js";
import { z } from "zod";
import { productService } from "./product.service.js";
import { orderService } from "./order.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { sanitizeDecimal } from "../lib/decimalHelper.js";

class AIService {
  async generateChatResponse(messages) {
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    const systemPrompt = "You are the FoodApp AI Assistant, a helpful and friendly virtual staff member. " +
                         "Your primary goal is to assist users with product inquiries and order status. " +
                         "\n\nCRITICAL INSTRUCTIONS:" +
                         "\n1. ALWAYS provide a clear, helpful text response to the user's message." +
                         "\n2. After calling any tool, you MUST summarize the findings in your response." +
                         "\n3. If a tool returns no results, explain this politely and suggest alternatives." +
                         "\n4. If products are found, mention their names and prices clearly." +
                         "\n5. Use a friendly, conversational tone.";

    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.toolCalls ? { toolCalls: m.toolCalls } : {}),
    }));

    const executeSkill = tool({
      description: `
Execute internal skill router to fetch data from the database.
Available Skills:
- searchProducts: { query: string } - Search for products by name, description, or category.
- getProduct: { slug: string } - Get detailed information about a product by its slug.
- getOrder: { orderCode: string } - Get order details by unique order code.

Use the 'skill' field to select the function and 'params' for arguments.
`,
      inputSchema: z.object({
        skill: z.enum(["searchProducts", "getProduct", "getOrder"]),
        params: z.object({
          query: z.string().optional(),
          slug: z.string().optional(),
          orderCode: z.string().optional(),
        }).optional(),
      }),
      execute: async ({ skill, params }) => {
        console.log("🔧 [TOOL CALLED]", { skill, params });
        let result;

        switch (skill) {
          case "searchProducts":
            result = await productService.findAll({ search: params?.query });
            break;
          case "getProduct":
            result = await productRepository.findBySlug(params?.slug);
            break;
          case "getOrder":
            result = await orderService.findByOrderCode(params?.orderCode);
            break;
          default:
            return { success: false, error: "Unknown skill: " + skill };
        }

        return sanitizeDecimal(result);
      },
    });

    let finalText = "";
    const allToolResults = [];

    // Manual Loop for reliability (up to 5 steps)
    for (let i = 0; i < 5; i++) {
      console.log(`\n--- AI STEP ${i + 1} START ---`);
      
      const result = await generateText({
        model: aiModel,
        system: systemPrompt,
        messages: history,
        tools: { executeSkill },
      });

      // result.response.messages contains the assistant message AND the tool result message
      // because executeSkill has an 'execute' function defined.
      if (result.response && result.response.messages) {
        history.push(...result.response.messages);
      } else {
        history.push(...result.responseMessages);
      }

      finalText = result.text || finalText;
      
      // Collect all tool results from this turn
      if (result.toolResults && result.toolResults.length > 0) {
        allToolResults.push(...result.toolResults);
      }

      // Check if there are any tool calls that were NOT executed or if we should continue
      // If result.text is not empty and there are no new tool calls in the LAST message, we can stop.
      const lastMessage = history[history.length - 1];
      const hasNewToolCalls = result.toolCalls && result.toolCalls.length > 0;
      
      // If the model gave us text and didn't call more tools, we're done.
      if (result.text && !hasNewToolCalls) {
        break;
      }

      // Safety break: if no text and no tool calls, something might be wrong.
      if (!result.text && !hasNewToolCalls) {
        break;
      }
    }

    // Return all findings and the final summarized text
    return {
      text: finalText,
      toolResults: allToolResults,
    };
  }
}

export const aiService = new AIService();
