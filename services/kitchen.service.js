import axios from "axios";
import { orderRepository } from "../repositories/order.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { ERR } from "../lib/httpExceptions.js";
import { OrderStatus } from "../constants/enum.js";
import { storeRepository } from "../repositories/store.repository.js";

class KitchenService  {
  constructor() {
    this.pythonBackendUrl =
      process.env.LOGISTIC_SOLVER_URL || "http://localhost:5002";
  }

  async getSchedule(storeId, tardinessWeight = 1000) {
    // 1. Lấy danh sách nhân viên của store (tất cả đều có thể là đầu bếp)
    const staff = await staffRepository.findByStore(storeId);
    const chefNames = staff.map((s) => s.user.email || s.user.phone || s.id);

    if (chefNames.length === 0) {
      throw ERR.BadRequest("No staff available in this store");
    }

    // 2. Lấy danh sách đơn hàng đang chờ hoặc đang chế biến của store
    // NEW -> Chờ, PREPARING -> Đang chế biến
    const orders = await orderRepository.findAll({
      where: {
        storeId,
        status: {
          in: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 3. Transform data cho Solver Backend
    const formattedOrders = orders.map((order) => {
      // Tính toán deadline: 30 phút sau khi tạo đơn (giả sử)
      const createdAt = new Date(order.createdAt);
      const deadline = new Date(createdAt.getTime() + 30 * 60000);

      // Tính tổng thời gian chế biến của đơn hàng
      const totalProcessingTime = order.items.reduce((sum, item) => {
        const prepTime = item.product.preparationTime || 10; // Mặc định 10p
        return sum + prepTime * item.quantity;
      }, 0);

      return {
        id: order.id,
        is_processing: order.status === OrderStatus.PREPARING,
        pic: order.status === OrderStatus.PREPARING ? "Current Chef" : null, // Cần lưu PIC trong DB nếu muốn chính xác hơn
        deadline_dt: deadline.toISOString(),
        processing_time_mins: totalProcessingTime,
      };
    });

    const payload = {
      now_dt: new Date().toISOString(),
      chef_list: chefNames,
      orders: formattedOrders,
      tardiness_weight: tardinessWeight,
    };

    try {
      const response = await axios.post(
        `${this.pythonBackendUrl}/schedule`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error calling Python Solver:", error.message);
      throw ERR.BadRequest(
        "Failed to get schedule from logistic solver",
      );
    }
  }

  async orderStoreBalance(){
    
    //get store
    const store = await storeRepository.findAll()

  } 
}

export const kitchenService = new KitchenService();
