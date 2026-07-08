import { orderRepository } from "../repositories/order.repository.js";
import { voucherRepository } from "../repositories/voucher.repository.js";
import { voucherService } from "./voucher.service.js"; // <-- Add this
import { customerRepository } from "../repositories/customer.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { storeRepository } from "../repositories/store.repository.js";
import { prisma } from "../lib/prisma.js";
import { ERR } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { OrderType, OrderStatus, StaffRole, DeliveryStatus, ROOT_USER_ID } from "../constants/enum.js";
import { buildOrderFilters } from "../lib/buildOrderFilters.js";
import { geocodeAddress } from "../lib/geocoding.js";

class OrderService  {

  // Customer (Auth) 
  // Staff (Auth) create order for Guest (user_id?)/ Customer

  // body
  // findByNameOrPhone
  // If true return createOrder 
  // else return error (add enum for error message)

  async createOrder(body, user) {
    return await prisma.$transaction(async (tx) => {
      const { storeId, type, items, note, tableNumber, deliveryInfo, voucherCode } = body;

      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);

      const customer = await customerRepository.findCustomerByUserId(user.id, tx);
      if (!customer) {
        throw ERR.NotFound(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      const customerId = customer.id;

      let discountAmount = 0;
      let voucher = null;
      if (voucherCode) {
        voucher = await voucherService.validateVoucher(voucherCode, subtotal, storeId, customerId);
        // Calculate discount
        if (voucher.discountType === 'PERCENT') {
          discountAmount = (Number(subtotal) * Number(voucher.discountValue)) / 100;
          if (voucher.maxDiscount !== null) {
            discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
          }
        } else {
          discountAmount = Number(voucher.discountValue);
        }
        // Cap discount at subtotal
        discountAmount = Math.min(discountAmount, Number(subtotal));
      }

      const totals = this.#calculateTotals(subtotal, type, discountAmount);

      const orderData = {
        orderCode: this.#generateOrderCode(type),
        storeId: type === OrderType.DELIVERY ? null : storeId,
        expectedReadyAt: type === OrderType.DELIVERY ? new Date(Date.now() + 90 * 60 * 1000) : null,
        type,
        subtotal,
        ...totals,
        note,
        tableNumber: type === OrderType.DINE_IN ? tableNumber : null,
        customerId,
        items: { create: orderItems },
        createdBy: user.id, // Set createdBy to the user ID (Customer)
      };

      if (voucher) {
        orderData.vouchers = {
          create: [{
            voucherId: voucher.id,
            discount: discountAmount
          }]
        };
      }

      // Handle Delivery info if applicable
      if (type === OrderType.DELIVERY && deliveryInfo) {
        console.log("[OrderService] Creating nested delivery order with data:", deliveryInfo);
        
        let lat = deliveryInfo.lat;
        let lng = deliveryInfo.lng;

        if (deliveryInfo.addressLine && (lat === undefined || lat === null || lng === undefined || lng === null)) {
          try {
            console.log(`[OrderService] Geocoding delivery address: ${deliveryInfo.addressLine}`);
            const geocoded = await geocodeAddress(deliveryInfo.addressLine);
            if (geocoded) {
              lat = geocoded.lat;
              lng = geocoded.lng;
              console.log(`[OrderService] Geocoding success: lat=${lat}, lng=${lng}`);
            }
          } catch (error) {
            console.error("Geocoding failed during order delivery creation:", error.message);
          }
        }

        orderData.delivery = {
          create: {
            storeId: null, // Delivery storeId is assigned by solver
            receiverName: deliveryInfo.receiverName,
            receiverPhone: deliveryInfo.receiverPhone,
            addressLine: deliveryInfo.addressLine,
            lat: lat,
            lng: lng,
          }
        };
      }

      console.log("[OrderService] Final orderData object:", JSON.stringify(orderData, null, 2));
      const order = await orderRepository.create(orderData, tx);

      if (voucher) {
        // Increment usedCount
        await tx.voucher.update({
          where: { id: voucher.id },
          data: {
            usedCount: { increment: 1 }
          }
        });

        // If customer-scoped, mark as used
        if (voucher.scope === 'CUSTOMER') {
          await tx.customerVoucher.update({
            where: {
              customerId_voucherId: {
                customerId,
                voucherId: voucher.id
              }
            },
            data: { isUsed: true }
          });
        }
      }

      // Record initial event for delivery order
      if (type === OrderType.DELIVERY) {
        const delivery = await tx.deliveryOrder.findUnique({
          where: { orderId: order.id }
        });
        if (delivery) {
          await tx.deliveryEvent.create({
            data: {
              deliveryId: delivery.id,
              status: OrderStatus.NEW,
              note: "Đơn hàng đã được đặt thành công",
            }
          });
        }
      }

      return await orderRepository.findByIdWithRelations(order.id, tx);
    });
  }

  async createOrderForStaff(storeId, body, user) {
    return await prisma.$transaction(async (tx) => {
      const { type, items, note, tableNumber, phone, deliveryInfo, voucherCode } = body;

      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);

      const customer = await customerRepository.findByPhone(phone, tx);
      if (!customer) {
        throw ERR.NotFound(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      const customerId = customer.id;
      
      let discountAmount = 0;
      let voucher = null;
      if (voucherCode) {
        voucher = await voucherService.validateVoucher(voucherCode, subtotal, storeId, customerId);
        // Calculate discount
        if (voucher.discountType === 'PERCENT') {
          discountAmount = (Number(subtotal) * Number(voucher.discountValue)) / 100;
          if (voucher.maxDiscount !== null) {
            discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
          }
        } else {
          discountAmount = Number(voucher.discountValue);
        }
        // Cap discount at subtotal
        discountAmount = Math.min(discountAmount, Number(subtotal));
      }
      
      const totals = this.#calculateTotals(subtotal, type, discountAmount);

      const orderData = {
        orderCode: this.#generateOrderCode(type),
        storeId: type === OrderType.DELIVERY ? null : storeId,
        expectedReadyAt: type === OrderType.DELIVERY ? new Date(Date.now() + 90 * 60 * 1000) : null,
        type,
        subtotal,
        ...totals,
        note,
        tableNumber: type === OrderType.DINE_IN ? tableNumber : null,
        customerId,
        items: { create: orderItems },
        createdBy: user?.id, // Set createdBy to the user ID (Staff)
      };

      if (voucher) {
        orderData.vouchers = {
          create: [{
            voucherId: voucher.id,
            discount: discountAmount
          }]
        };
      }

      // Handle Delivery info if applicable
      if (type === OrderType.DELIVERY && deliveryInfo) {
        console.log("[OrderService] Creating nested delivery order with data:", deliveryInfo);
        
        let lat = deliveryInfo.lat;
        let lng = deliveryInfo.lng;

        if (deliveryInfo.addressLine && (lat === undefined || lat === null || lng === undefined || lng === null)) {
          try {
            console.log(`[OrderService] Geocoding delivery address: ${deliveryInfo.addressLine}`);
            const geocoded = await geocodeAddress(deliveryInfo.addressLine);
            if (geocoded) {
              lat = geocoded.lat;
              lng = geocoded.lng;
              console.log(`[OrderService] Geocoding success: lat=${lat}, lng=${lng}`);
            }
          } catch (error) {
            console.error("Geocoding failed during order delivery creation:", error.message);
          }
        }

        orderData.delivery = {
          create: {
            storeId: null, // Delivery storeId is assigned by solver
            receiverName: deliveryInfo.receiverName,
            receiverPhone: deliveryInfo.receiverPhone,
            addressLine: deliveryInfo.addressLine,
            lat: lat,
            lng: lng,
          }
        };
      }

      console.log("[OrderService] Final orderData object:", JSON.stringify(orderData, null, 2));
      const order = await orderRepository.create(orderData, tx);

      if (voucher) {
        // Increment usedCount
        await tx.voucher.update({
          where: { id: voucher.id },
          data: {
            usedCount: { increment: 1 }
          }
        });

        // If customer-scoped, mark as used
        if (voucher.scope === 'CUSTOMER') {
          await tx.customerVoucher.update({
            where: {
              customerId_voucherId: {
                customerId,
                voucherId: voucher.id
              }
            },
            data: { isUsed: true }
          });
        }
      }

      // Record initial event for delivery order
      if (type === OrderType.DELIVERY) {
        const delivery = await tx.deliveryOrder.findUnique({
          where: { orderId: order.id }
        });
        if (delivery) {
          await tx.deliveryEvent.create({
            data: {
              deliveryId: delivery.id,
              status: OrderStatus.NEW,
              note: "Đơn hàng đã được đặt thành công (bởi nhân viên)",
            }
          });
        }
      }

      return await orderRepository.findByIdWithRelations(order.id, tx);
    });
  }

  async findByPhone(phone, user, query) {
    const customer = await customerRepository.findCustomerByUserId(user.id);
    if (!customer) throw ERR.NotFound("Không tìm thấy thông tin khách hàng.");

    return await orderRepository.findByPhone(phone, customer.id, query);
  }

  async findByOrderCode(orderCode) {
    const order = await orderRepository.findByOrderCode(orderCode);

    if (!order) {
      throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Get staff info for createdBy
    const createdBy = await this.#getStaffInfoById(order.createdBy);

    return {
      ...order,
      createdBy,
    };
  }

  async getOrders(userId, query = {}) {
    const filters = buildOrderFilters({ userId, query });
    const result = await orderRepository.getOrdersByFiltersWithDetails(filters);

    const enrichedItems = await this.#enrichOrdersWithStaffInfo(result.items);

    return {
      items: enrichedItems,
      meta: result.meta,
    };
  }

  async getOrdersForStaff(storeId, query = {}, user = null) {
    const filters = buildOrderFilters({ storeId, query });

    const role = user?.staff?.role;
    const staffId = user?.staff?.id;

    if (role === StaffRole.KITCHEN && staffId) {
      filters.where.OR = [
        { storeId, type: { in: [OrderType.DINE_IN, OrderType.TAKEAWAY] } },
        { type: OrderType.DELIVERY, chefId: staffId },
      ];
      delete filters.where.storeId;
    } else if (role === StaffRole.SHIPPER && staffId) {
      filters.where = {
        type: OrderType.DELIVERY,
        delivery: { shipperId: staffId },
      };
    }

    const result = await orderRepository.getOrdersByFiltersWithDetails(filters);

    const enrichedItems = await this.#enrichOrdersWithStaffInfo(result.items);

    return {
      items: enrichedItems,
      meta: result.meta,
    };
  }

  async getOrdersByStoreId(storeId, query = {}, user) {
    // 1. Check if store exists
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw ERR.NotFound(VALIDATION_MESSAGES.STORE_NOT_FOUND);
    }

    // 2. Permission check: Staff can only view their own store unless they are ADMIN/OWNER
    if (user.staff && 
        user.staff.role !== "ADMIN" && 
        user.staff.role !== "OWNER" && 
        user.staff.storeId !== storeId) {
      throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    return await orderRepository.getOrdersByStoreId(storeId, query);
  }

  async #enrichOrdersWithStaffInfo(orders) {
    return await Promise.all(
      orders.map(async (order) => {
        const createdBy = await this.#getStaffInfoById(order.createdBy);
        return {
          ...order,
          createdBy,
        };
      })
    );
  }

  async updateStatus(id, status, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (user.staff && 
          user.staff.role !== StaffRole.ADMIN && 
          user.staff.role !== StaffRole.OWNER) {

        const canUpdate =
          order.storeId === user.staff.storeId ||
          (order.type === OrderType.DELIVERY && order.chefId === user.staff.id) ||
          (order.type === OrderType.DELIVERY && order.delivery?.shipperId === user.staff.id);

        if (!canUpdate) {
          throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          delivery: true,
          store: true,
          customer: true,
          items: true,
        }
      });

      // Record Delivery Event if it's a delivery order
      if (updatedOrder.delivery) {
        let note = `Trạng thái đơn hàng thay đổi thành ${status}`;
        
        // Custom notes based on status
        if (status === OrderStatus.CONFIRMED) note = "Đơn hàng đã được xác nhận";
        else if (status === OrderStatus.PREPARING) note = "Cửa hàng đang chuẩn bị món ăn";
        else if (status === OrderStatus.READY) note = "Đơn hàng đã sẵn sàng để giao";
        else if (status === OrderStatus.CANCELLED) note = "Đơn hàng đã bị hủy";

        await tx.deliveryEvent.create({
          data: {
            deliveryId: updatedOrder.delivery.id,
            status: status,
            note: note,
          }
        });
      }

      return updatedOrder;
    });
  }

  async getOrderActivities(id, user) {
    const order = await orderRepository.findByIdWithRelations(id);

    if (!order) {
      throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    if (order.customerId !== user.customer?.id && !user.staff) {
      throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    let routeData = null;
    if (order.type === OrderType.DELIVERY && order.delivery?.shipperId) {
      const deliveryRoute = await prisma.deliveryRoute.findUnique({
        where: { shipperId: order.delivery.shipperId }
      });
      if (deliveryRoute?.route) {
        routeData = deliveryRoute.route;
      }
    }

    return this.#buildTimeline(order, routeData);
  }

  #buildTimeline(order, routeData = null) {
    const statusFlow = [
      OrderStatus.NEW,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERING,
      OrderStatus.COMPLETED,
    ];

    const eventMap = {};
    for (const evt of (order.delivery?.events || [])) {
      if (!eventMap[evt.status]) eventMap[evt.status] = evt;
    }

    const currentIdx = statusFlow.indexOf(order.status);
    const timeline = [];

    for (const status of statusFlow) {
      if (status === OrderStatus.DELIVERING && order.type !== OrderType.DELIVERY) continue;

      const event = eventMap[status];
      const reached = statusFlow.indexOf(status) <= currentIdx;

      if (!event && !reached) continue;

      const time = event?.createdAt ?? this.#statusTime(order, status);
      const item = { status, time: time || null, isPast: reached };

      if (event?.note) {
        item.description = event.note;
      }

      switch (status) {
        case OrderStatus.NEW:
          item.label = 'Order Placed';
          item.description ??= 'Your order has been acknowledged by the collective.';
          break;
        case OrderStatus.CONFIRMED:
          item.label = 'Confirmed';
          item.description ??= 'Your order has been confirmed.';
          break;
        case OrderStatus.PREPARING:
          item.label = 'Preparing';
          item.description ??= 'Our artisans are meticulously crafting your ritual.';
          break;
        case OrderStatus.READY:
          item.label = order.type === OrderType.DELIVERY ? 'Ready for pickup' : 'Ready';
          item.description ??= order.type === OrderType.DELIVERY
            ? 'Your order is ready for the courier.'
            : 'Your order is ready to be served.';
          break;
        case OrderStatus.DELIVERING:
          item.label = 'Out for delivery';
          item.description ??= 'Your courier is navigating the city to your doorstep.';
          break;
        case OrderStatus.COMPLETED:
          item.label = 'Delivered';
          item.description ??= 'The warmth has arrived.';
          break;
      }

      timeline.push(item);
    }

    // Estimated delivery ETA from route data or fallback to expectedReadyAt
    if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED) {
      let eta = order.expectedReadyAt;

      if (routeData && order.delivery?.shipperId) {
        const routeStep = Array.isArray(routeData)
          ? routeData.find(s => s.orderId === order.id && s.type === 'DELIVERY')
          : null;
        if (routeStep?.arrival_datetime) {
          eta = new Date(routeStep.arrival_datetime);
        }
      }

      if (eta) {
        timeline.push({
          status: 'ESTIMATED',
          label: 'Delivered',
          time: eta,
          isPast: false,
          isEstimate: true,
          description: 'Estimated delivery time.',
        });
      }
    }

    return timeline;
  }

  #statusTime(order, status) {
    if (status === OrderStatus.COMPLETED) return order.delivery?.deliveredAt ?? order.updatedAt;
    if (status === OrderStatus.NEW) return order.createdAt;
    return order.updatedAt;
  }


  async confirmPickup(id, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (order.status !== OrderStatus.READY) {
        throw ERR.BadRequest(ERROR_MESSAGES.ORDER_STATUS_INVALID);
      }

      // Check if user is a shipper
      if (user.staff?.role !== StaffRole.SHIPPER) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      // Check if order is assigned to this shipper
      if (order.delivery?.shipperId !== user.staff.id) {
        throw ERR.Forbidden(ERROR_MESSAGES.ORDER_NOT_ASSIGNED_TO_SHIPPER);
      }

      // Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.DELIVERING,
          delivery: {
            update: {
              status: DeliveryStatus.PICKED_UP,
              pickedAt: new Date(),
            }
          }
        },
        include: {
          delivery: true,
          store: true,
          customer: true,
          items: true,
        }
      });

      // Record Delivery Event
      await tx.deliveryEvent.create({
        data: {
          deliveryId: order.delivery.id,
          status: DeliveryStatus.PICKED_UP,
          note: `Đơn hàng đã được lấy bởi shipper ${user.name || user.id}`,
        }
      });

      // Update DeliveryRoute step statuses
      const deliveryRoute = await tx.deliveryRoute.findUnique({
        where: { shipperId: user.staff.id }
      });
      if (deliveryRoute) {
        const updatedRoute = deliveryRoute.route.map(step => {
          if (step.orderId === id) {
            if (step.type === "STORE") {
              return { ...step, status: "COMPLETED" };
            }
            if (step.type === "DELIVERY") {
              return { ...step, status: "IN_PROGRESS" };
            }
          }
          return step;
        });
        await tx.deliveryRoute.update({
          where: { shipperId: user.staff.id },
          data: { route: updatedRoute }
        });
      }

      return updatedOrder;
    });
  }

  async completeOrder(id, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (order.type === OrderType.DELIVERY) {
        throw ERR.BadRequest("Dùng API complete cho đơn giao hàng");
      }

      if (order.status !== OrderStatus.READY) {
        throw ERR.BadRequest(ERROR_MESSAGES.ORDER_STATUS_INVALID);
      }

      if (user.staff && user.staff.role !== StaffRole.ADMIN && user.staff.role !== StaffRole.OWNER && order.storeId !== user.staff.storeId) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.COMPLETED },
        include: {
          store: true,
          customer: true,
          items: { include: { product: true, options: true } },
          delivery: true,
          assignedChef: { include: { user: true } },
        },
      });

      return updatedOrder;
    });
  }

  async completeDelivery(id, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (order.status !== OrderStatus.DELIVERING) {
        throw ERR.BadRequest(ERROR_MESSAGES.ORDER_STATUS_INVALID);
      }

      // Check if user is a shipper
      if (user.staff?.role !== StaffRole.SHIPPER) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      if (order.delivery?.shipperId !== user.staff.id) {
        throw ERR.Forbidden(ERROR_MESSAGES.ORDER_NOT_ASSIGNED_TO_SHIPPER);
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
          delivery: {
            update: {
              status: DeliveryStatus.DELIVERED,
              deliveredAt: new Date(),
            }
          }
        },
        include: {
          delivery: true,
          store: true,
          customer: true,
          items: true,
        }
      });

      await tx.deliveryEvent.create({
        data: {
          deliveryId: order.delivery.id,
          status: DeliveryStatus.DELIVERED,
          note: `Đơn hàng đã được giao thành công bởi shipper ${user.name || user.id}`,
        }
      });

      // Update DeliveryRoute step status
      const deliveryRoute = await tx.deliveryRoute.findUnique({
        where: { shipperId: user.staff.id }
      });
      if (deliveryRoute) {
        const updatedRoute = deliveryRoute.route.map(step => {
          if (step.orderId === id && step.type === "DELIVERY") {
            return { ...step, status: "COMPLETED" };
          }
          return step;
        });
        await tx.deliveryRoute.update({
          where: { shipperId: user.staff.id },
          data: { route: updatedRoute }
        });
      }

      return updatedOrder;
    });
  }

  async #buildOrderItems(items, tx) {
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await productRepository.findById(item.productId, null, tx);

      if (!product) {
        throw ERR.BadRequest(`${VALIDATION_MESSAGES.PRODUCT_NOT_FOUND} (${item.productId})`);
      }

      let optionsPrice = 0;
      const snapshotOptions = [];

      if (item.options && item.options.length > 0) {
        for (const opt of item.options) {
          // Find the option value for this specific product
          const optionValue = await tx.productOptionValue.findUnique({
            where: {
              productId_optionId: {
                productId: item.productId,
                optionId: opt.optionId
              }
            },
            include: { option: true }
          });

          if (!optionValue) {
            throw ERR.BadRequest(`Option ${opt.optionId} is not valid for product ${item.productId}`);
          }

          const price = Number(optionValue.price);
          optionsPrice += price;
          snapshotOptions.push({
            name: optionValue.option.name,
            price: price
          });
        }
      }

      const itemPrice = Number(product.basePrice);
      const itemSubtotal = (itemPrice + optionsPrice) * item.quantity;
      subtotal += itemSubtotal;

      const orderItemData = {
        productId: item.productId,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        quantity: item.quantity,
        note: item.note || null,
        tax: 0,
        discount: 0,
      };

      if (snapshotOptions.length > 0) {
        orderItemData.options = {
          create: snapshotOptions,
        };
      }

      orderItems.push(orderItemData);
    }

    return { orderItems, subtotal };
  }

  #calculateTotals(subtotal, type, discountAmount = 0) {
    const serviceFee = type === OrderType.DELIVERY ? 15000 : 0;
    const tax = Number(subtotal) * 0.08; // 8% VAT
    const discount = Number(discountAmount);
    const total = Math.max(0, Number(subtotal) - discount + tax + serviceFee);

    return { serviceFee, tax, discount, total };
  }

  #generateOrderCode(type) {
    const prefix = "VD";
    const typeMapping = {
      [OrderType.DELIVERY]: "DE",
      [OrderType.TAKEAWAY]: "TA",
      [OrderType.DINE_IN]: "DI",
    };
    const typeCode = typeMapping[type] || "OR";
    const timestamp = Date.now();
    return `${prefix}-${typeCode}-${timestamp}`;
  }

  async remove(id, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (user.staff && user.staff.role !== StaffRole.ADMIN && user.staff.role !== StaffRole.OWNER && order.storeId !== user.staff.storeId) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          store: true,
          customer: true,
          items: { include: { product: true, options: true } },
          delivery: true,
          assignedChef: { include: { user: true } },
        },
      });

      if (updatedOrder.delivery) {
        await tx.deliveryEvent.create({
          data: {
            deliveryId: updatedOrder.delivery.id,
            status: OrderStatus.CANCELLED,
            note: `Đơn hàng đã bị hủy bởi ${user.staff?.role || user.name}`,
          },
        });
      }

      return updatedOrder;
    });
  }

  async #getStaffInfoById(staffId) {
    if (!staffId) return null;

    const staff = await staffRepository.findWithUser(staffId);

    if (!staff) return null;

    return {
      id: staff.id,
      name: staff.user.email,
    };
  }

}

export const orderService = new OrderService();
