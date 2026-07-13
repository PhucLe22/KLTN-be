import { orderService } from "../services/order.service.js";
import { kitchenService } from "../services/kitchen.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { OrderMap, StaffOrderSummaryMap, OrderActivityMap } from "../contracts/output/order.output.schema.js";

class OrderController {
  create = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body, req.user);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  createForStaff = asyncHandler(async (req, res) => {
    const staffStoreId = req.user?.staff?.storeId;
    const order = await orderService.createOrderForStaff(staffStoreId, req.body, req.user);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  showByCode = asyncHandler(async (req, res) => {
    const { orderCode } = req.params;
    const order = await orderService.findByOrderCode(orderCode);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  searchByPhone = asyncHandler(async (req, res) => {
    const { phone } = req.params;
    const orders = await orderService.findByPhone(phone, req.user, req.query);
    const result = mapper(orders.items, OrderMap);

    return res.ok(result, orders.meta);
  });

  list = asyncHandler(async (req, res) => {
    const userId = req.user?.id; // không có user thì bị đá ra từ vòng validate 
    const orders = await orderService.getOrders(userId, req.query);
    const result = mapper(orders.items, OrderMap);

    return res.ok(result, orders.meta);
  });

  /**
   * Get orders for staff (filter by store)
   * Query params: status, type, page, limit
   */
  listForStaff = asyncHandler(async (req, res) => {
    const staffStoreId = req.user?.staff?.storeId;
    const orders = await orderService.getOrdersForStaff(staffStoreId, req.query, req.user);
    const result = mapper(orders.items, OrderMap);

    return res.ok(result, orders.meta);
  });

  listByStoreId = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const orders = await orderService.getOrdersByStoreId(storeId, req.query, req.user);
    const result = mapper(orders.items, StaffOrderSummaryMap);

    return res.ok(result, orders.meta);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateStatus(id, status, req.user);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  confirmPickup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.confirmPickup(id, req.user);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  completeDelivery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.completeDelivery(id, req.user);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  returnDelivery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await orderService.returnDelivery(id, req.user, reason);

    const storeId = order.storeId;
    if (storeId) {
      kitchenService.getSchedule([storeId], 1000, req.user.staff.id).catch((err) => {
        console.error("[returnDelivery] Re-solve failed:", err.message);
      });
    }

    const result = mapper(order, OrderMap);
    return res.ok(result);
  });

  completeOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.completeOrder(id, req.user);
    const result = mapper(order, OrderMap);

    return res.ok(result);
  });

  remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.remove(id, req.user);
    const result = mapper(order, OrderMap);
    return res.ok(result);
  });

  getActivities = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const activities = await orderService.getOrderActivities(id, req.user);
    const result = mapper(activities, OrderActivityMap);

    return res.ok(result);
  });
}

export const orderController = new OrderController();
