import { generateText, tool } from "ai";
import { aiModel } from "../lib/ai.js";
import { z } from "zod";
import { productService } from "./product.service.js";
import { orderService } from "./order.service.js";
import { storeService } from "./store.service.js";
import { voucherService } from "./voucher.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { sanitizeDecimal } from "../lib/decimalHelper.js";
import { geocodeAddress } from "../lib/geocoding.js";
import { calculateDistance } from "../lib/helpers.js";

class AIService {
  async generateChatResponse(messages) {
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    const systemPrompt =
      "Bạn là FoodApp AI Assistant, một nhân viên ảo thân thiện và hữu ích. " +
      "Nhiệm vụ chính của bạn là hỗ trợ người dùng tra cứu sản phẩm, kiểm tra đơn hàng và tìm cửa hàng." +
      "\n\nLUÔN LUÔN trả lời bằng TIẾNG VIỆT." +
       "\n\nHƯỚNG DẪN QUAN TRỌNG:" +
      "\n1. LUÔN trả lời bằng tiếng Việt, thân thiện, tự nhiên." +
      "\n\nQUY TẮC QUAN TRỌNG: KHÔNG BAO GIỜ đề cập đến 'tool', function, API, hay bất kỳ thuật ngữ kỹ thuật nào trong câu trả lời. Chỉ trả lời bằng ngôn ngữ tự nhiên như một nhân viên thực thụ. Ví dụ: thay vì nói 'tôi sẽ gọi tool findClosestStore', hãy nói 'tôi sẽ tìm cửa hàng gần nhất cho bạn'." +
      "\n2. Khi sử dụng tool, bạn PHẢI dùng thông tin nhận được để trả lời người dùng ngay lập tức." +
      "\n3. Không gọi cùng một tool nhiều lần nếu đã có kết quả." +
      "\n4. Nếu tool không trả về kết quả, hãy giải thích lịch sự và gợi ý giải pháp khác." +
       "\n5. Khi người dùng hỏi tìm cửa hàng gần nhất, bạn PHẢI hỏi địa chỉ của họ TRƯỚC. KHÔNG BAO GIỜ tự ý gán/đoán địa chỉ của người dùng. CHỈ gọi tool 'findClosestStore' sau khi người dùng cung cấp địa chỉ cụ thể." +
      "\n6. Nếu người dùng hỏi trạng thái đơn hàng, hãy hỏi mã đơn hàng trước nếu chưa có, sau đó dùng tool 'getOrder'." +
      "\n7. Nếu người dùng hỏi về khuyến mãi, voucher, mã giảm giá, hãy dùng tool 'checkPromotions'.";

    let history = messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.toolCalls ? { toolCalls: m.toolCalls } : {}),
    }));

    const tools = {
      searchProducts: tool({
        description: "Search for products by name, description, or category.",
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => sanitizeDecimal(await productService.findAll({ search: query })),
      }),
      getProduct: tool({
        description: "Get detailed information about a product by its slug.",
        inputSchema: z.object({ slug: z.string() }),
        execute: async ({ slug }) => sanitizeDecimal(await productRepository.findBySlug(slug)),
      }),
      getOrder: tool({
        description: "Get order details by unique order code.",
        inputSchema: z.object({ orderCode: z.string() }),
        execute: async ({ orderCode }) => sanitizeDecimal(await orderService.findByOrderCode(orderCode)),
      }),
      checkPromotions: tool({
        description: "Get available promotions/vouchers/discounts. Optionally filter by store ID or minimum order amount.",
        inputSchema: z.object({
          storeId: z.string().optional().describe("Store ID to filter promotions for a specific store"),
          orderAmount: z.number().optional().describe("Minimum order amount to check applicable promotions"),
        }),
        execute: async ({ storeId, orderAmount }) => {
          const vouchers = await voucherService.getAvailableVouchers({ storeId, orderAmount });
          return vouchers.map((v) => ({
            code: v.code,
            discountType: v.discountType,
            discountValue: Number(v.discountValue),
            minOrderAmount: v.minOrderAmount ? Number(v.minOrderAmount) : null,
            maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : null,
            expiresAt: v.expiresAt,
            storeName: v.store?.name || null,
          }));
        },
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
        description: "Find the closest store based on the provided address. ONLY call this when the user has explicitly given you their address - NEVER guess the user's address.",
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

    const result = await generateText({
      model: aiModel,
      system: systemPrompt,
      messages: history,
      tools: tools,
      maxSteps: 5,
    });

    return {
      text: result.text,
      toolResults: result.toolResults || [],
    };
  }
}

export const aiService = new AIService();
