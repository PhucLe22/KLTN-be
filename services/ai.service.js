import { generateText, tool } from "ai";
import { aiModel } from "../lib/ai.js";
import { z } from "zod";
import { productService } from "./product.service.js";
import { orderService } from "./order.service.js";
import { storeService } from "./store.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { sanitizeDecimal } from "../lib/decimalHelper.js";
import { geocodeAddress } from "../lib/geocoding.js";
import { calculateDistance } from "../lib/helpers.js";

class AIService {
  async generateChatResponse(messages) {
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    const systemPrompt =
      "You are the FoodApp AI Assistant, a helpful and friendly virtual staff member. " +
      "Your primary goal is to assist users with product inquiries, order status, and finding stores." +
      "\n\nCRITICAL INSTRUCTIONS:" +
      "\n1. ALWAYS provide a clear, helpful text response to the user's message." +
      "\n2. When you use a tool, you MUST use the information returned to answer the user immediately." +
      "\n3. Do not call the same tool repeatedly if you have already received a result." +
      "\n4. If a tool returns no results, explain this politely and suggest alternatives." +
      "\n5. Use a friendly, conversational tone." +
      "\n6. If a user asks for the closest store, ask for their address first if not provided, then use the 'findClosestStore' tool." +
      "\n7. If a user asks for order status, ask for their orderCode first if not provided, then use the 'getOrder' tool.";

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.toolCalls ? { toolCalls: m.toolCalls } : {}),
    }));

    const tools = {
      searchProducts: tool({
        description: "Search for products by name, description, or category.",
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => await productService.findAll({ search: query }),
      }),
      getProduct: tool({
        description: "Get detailed information about a product by its slug.",
        inputSchema: z.object({ slug: z.string() }),
        execute: async ({ slug }) => await productRepository.findBySlug(slug),
      }),
      getOrder: tool({
        description: "Get order details by unique order code.",
        inputSchema: z.object({ orderCode: z.string() }),
        execute: async ({ orderCode }) => await orderService.findByOrderCode(orderCode),
      }),
      findAllStores: tool({
        description: "Get a list of all available stores.",
        inputSchema: z.object({}),
        execute: async () => {
          const allStores = await storeService.findAll({});
          return allStores.items.map((store) => ({
            storeName: store.name,
            address: store.address,
          }));
        },
      }),
      findClosestStore: tool({
        description: "Find the closest store based on the provided address.",
        inputSchema: z.object({ address: z.string() }),
        execute: async ({ address }) => {
          const { lat: userLat, lng: userLng } = await geocodeAddress(address);
          const stores = await storeService.findAll({});
          const storesWithDistance = stores.items.map((store) => ({
            storeName: store.name,
            address: store.address,
            distance: calculateDistance(userLat, userLng, store.lat, store.lng),
            lat: store.lat,
            lng: store.lng,
          }));
          storesWithDistance.sort((a, b) => a.distance - b.distance);
          return storesWithDistance[0];
        },
      }),
    };

    let finalText = "";
    const allToolResults = [];

    // Manual Loop for reliability (up to 5 steps)
    for (let i = 0; i < 5; i++) {
      console.log(`\n--- AI STEP ${i + 1} START ---`);

      const result = await generateText({
        model: aiModel,
        system: systemPrompt,
        messages: history,
        tools: tools,
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
