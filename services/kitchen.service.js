import axios from "axios";
import { staffRepository } from "../repositories/staff.repository.js";
import { ERR } from "../lib/httpExceptions.js";
import { OrderStatus, StaffRole } from "../constants/enum.js";
import { storeRepository } from "../repositories/store.repository.js";
import { geocodeAddress, getRouteMatrix } from "../lib/geocoding.js";
import { prisma } from "../lib/prisma.js";
import { mapper } from "../lib/mapper.js";
import { InternalDeliveryQueueMap } from "../contracts/output/ship.output.schema.js";

class KitchenService {
  constructor() {
    this.pythonBackendUrl =
      process.env.LOGISTIC_SOLVER_URL || "http://localhost:8000";
  }

  async getSchedule(storeId, tardinessWeight = 1000) {
    console.log(
      `[KitchenService] Triggering unified solver for store ${storeId}...`,
    );

    // 1. Get all staff and categorize
    const allStaff = await staffRepository.findByStore(storeId);
    if (allStaff.length === 0) {
      throw ERR.BadRequest("No staff available in this store");
    }

    const shippers = allStaff.filter((s) => s.role === StaffRole.SHIPPER);
    const chefs = allStaff.filter((s) => s.role !== StaffRole.SHIPPER);
    const targetChefs = chefs.length > 0 ? chefs : allStaff;
    const chefNames = targetChefs.map(
      (s) => s.user.email || s.user.phone || s.id,
    );
    const targetShippers = shippers.length > 0 ? shippers : allStaff;

    // 2. Get orders for Kitchen Schedule (CONFIRMED & PREPARING)
    const deliveryOrders = await prisma.deliveryOrder.findMany({
      where: {
        storeId,
        order: {
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING],
          },
        },
      },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
            assignedChef: { include: { user: true } },
          },
        },
      },
    });

    const kitchenOrders = deliveryOrders.map((doRec) => ({
      ...doRec.order,
      delivery: doRec,
    }));

    console.log(
      `[KitchenService] Found ${kitchenOrders.length} orders for kitchen scheduling.`,
    );
    kitchenOrders.forEach((o) =>
      console.log(
        `[KitchenService] Order: ${o.orderCode}, Status: ${o.status}, Type: ${o.type}`,
      ),
    );

    // 3. Solve Kitchen Schedule
    const formattedKitchenOrders = kitchenOrders.map((order) => {
      const createdAt = new Date(order.createdAt);
      const deadline = new Date(createdAt.getTime() + 30 * 60000);
      const totalProcessingTime = order.items.reduce((sum, item) => {
        const prepTime = item.product?.preparationTime || 10;
        return sum + prepTime * item.quantity;
      }, 0);

      // PIC MUST match one of the entries in chefNames
      let currentPic = null;
      if (order.assignedChef) {
        currentPic =
          order.assignedChef.user.email ||
          order.assignedChef.user.phone ||
          order.assignedChef.id;
      }

      return {
        id: order.id,
        is_processing: order.status === OrderStatus.PREPARING,
        pic: currentPic,
        finished_time_dt: order.expectedReadyAt
          ? new Date(order.expectedReadyAt).toISOString()
          : null,
        deadline_dt: deadline.toISOString(),
        processing_time_mins: totalProcessingTime || 10,
      };
    });

    const kitchenPayload = {
      now_dt: new Date().toISOString(),
      chef_list: chefNames,
      orders: formattedKitchenOrders,
      tardiness_weight: tardinessWeight,
    };

    console.log(
      `[KitchenService] Sending ${formattedKitchenOrders.length} orders to Kitchen Solver.`,
    );
    console.log(`[KitchenService] Chef List: ${chefNames.join(", ")}`);
    if (formattedKitchenOrders.length > 0) {
      console.log(
        `[KitchenService] Sample Order Payload:`,
        JSON.stringify(formattedKitchenOrders[0], null, 2),
      );
    }

    let kitchenResult = { schedule: [] };
    try {
      const response = await axios.post(
        `${this.pythonBackendUrl}/schedule`,
        kitchenPayload,
      );
      kitchenResult = response.data;

      // PERSIST Kitchen Results
      await this.#saveKitchenAssignments(kitchenResult.schedule, targetChefs);
    } catch (error) {
      console.error("Error calling Kitchen Solver:", error.message);
      throw ERR.BadRequest("Failed to get kitchen schedule from solver");
    }

    // 4. Get orders for Delivery Routing (READY)
    const deliveryOrdersForRouting = await prisma.deliveryOrder.findMany({
      where: {
        storeId,
        order: {
          status: OrderStatus.READY,
        },
      },
      include: {
        order: true,
        store: true,
      },
    });

    // 5. Combine READY and predicted DELIVERY orders
    const ordersForRouting = [...deliveryOrdersForRouting];
    const kitchenScheduleMap = new Map(
      kitchenResult.schedule.map((s) => [s.OrderID, s]),
    );

    for (const order of kitchenOrders) {
      const schedule = kitchenScheduleMap.get(order.id);
      if (schedule) {
        // If not in readyOrders, but scheduled to be ready soon
        const isAlreadyInRouting = deliveryOrdersForRouting.some(
          (doRec) => doRec.orderId === order.id,
        );
        if (!isAlreadyInRouting) {
          order.expectedReadyAt = new Date(schedule.FinishedTime);
          if (order.delivery) {
            ordersForRouting.push(order.delivery);
          }
        }
      }
    }

    const uniqueOrdersForRouting = Array.from(
      new Map(ordersForRouting.map((o) => [o.id, o])).values(),
    );

    if (uniqueOrdersForRouting.length === 0) {
      return { kitchen: kitchenResult, delivery: { schedule: [] } };
    }

    // 6. Build VRP
    const store = await storeRepository.findById(storeId);
    if (!store.lat || !store.lng) {
      const geo = await geocodeAddress(store.address);
      store.lat = geo.lat;
      store.lng = geo.lng;
    }

    const locations = [{ lat: store.lat, lng: store.lng }];
    const orderIdMap = [];
    const now = new Date();

    for (const deliveryOrder of uniqueOrdersForRouting) {
      if (!deliveryOrder.addressLine) continue;
      try {
        let orderLat = deliveryOrder.lat;
        let orderLng = deliveryOrder.lng;

        if (!orderLat || !orderLng) {
          const geo = await geocodeAddress(deliveryOrder.addressLine);
          orderLat = geo.lat;
          orderLng = geo.lng;
          // Save geocoded coords back to DeliveryOrder for future use
          await prisma.deliveryOrder.update({
            where: { id: deliveryOrder.id },
            data: { lat: orderLat, lng: orderLng },
          });
        }

        locations.push({ lat: store.lat, lng: store.lng }); // Pickup Node
        locations.push({ lat: orderLat, lng: orderLng }); // Delivery Node

        const readyAt = deliveryOrder.order?.expectedReadyAt || now;
        const pickupOffset = Math.max(0, Math.round((readyAt - now) / 60000));

        orderIdMap.push({
          id: deliveryOrder.orderId,
          orderCode: deliveryOrder.order?.orderCode || "N/A",
          pickupOffset,
        });
      } catch (e) {
        console.warn(
          `Geocode fail for ${deliveryOrder.order?.orderCode || "N/A"}: ${e.message}`,
        );
      }
    }

    if (orderIdMap.length === 0) {
      return { kitchen: kitchenResult, delivery: { schedule: [] } };
    }

    const matrixData = await getRouteMatrix(locations);
    const timeMatrix = matrixData.sources_to_targets.map((row) =>
      row.map((cell) => Math.round(cell.time / 60)),
    );

    const pickupsDeliveries = [];
    const demands = [0];
    const timeWindows = [[0, 1440]];

    for (let i = 0; i < orderIdMap.length; i++) {
      const pickupNode = 2 * i + 1;
      const deliveryNode = 2 * i + 2;
      pickupsDeliveries.push([pickupNode, deliveryNode]);
      demands.push(1);
      demands.push(-1);

      const startWindow = orderIdMap[i].pickupOffset;
      timeWindows.push([startWindow, startWindow + 120]); // Loose windows
      timeWindows.push([startWindow, startWindow + 240]);
    }

    const vrpPayload = {
      num_vehicles: targetShippers.length,
      starts: new Array(targetShippers.length).fill(0),
      ends: new Array(targetShippers.length).fill(0),
      time_matrix: timeMatrix,
      pickups_deliveries: pickupsDeliveries,
      demands: demands,
      vehicle_capacities: new Array(targetShippers.length).fill(10),
      time_windows: timeWindows,
    };

    try {
      const vrpResponse = await axios.post(
        `${this.pythonBackendUrl}/vrp`,
        vrpPayload,
      );
      console.log(
        `[KitchenService] VRP returned ${vrpResponse.data.length} steps.`,
      );

      const deliverySchedule = vrpResponse.data.map((entry) => {
        const node = entry.node;
        const location = locations[node];
        const res = {
          ...entry,
          type: "STORE",
          orderId: null,
          orderCode: null,
          lat: location.lat,
          lng: location.lng,
        };
        if (node > 0) {
          const isPickup = node % 2 !== 0;
          const idx = isPickup ? (node + 1) / 2 - 1 : node / 2 - 1;
          const o = orderIdMap[idx];
          res.type = isPickup ? "PICKUP" : "DELIVERY";
          res.orderId = o.id;
          res.orderCode = o.orderCode;
        }
        const shipper = targetShippers[entry.shipper_id];
        if (shipper) {
          res.shipperId = shipper.id;
          res.shipperName =
            shipper.user.name || shipper.user.email || shipper.id;
        }
        return res;
      });

      // PERSIST VRP Results
      await this.#saveDeliveryRoutes(deliverySchedule);

      const formattedOrders = await this.#formatOrdersForFrontend(
        storeId,
        targetShippers,
      );

      return {
        kitchen: kitchenResult,
        delivery: {
          numShippers: targetShippers.length,
          numOrders: orderIdMap.length,
          schedule: deliverySchedule,
          formattedOrders,
        },
      };
    } catch (error) {
      console.error("Error calling VRP Solver:", error.message);
      return {
        kitchen: kitchenResult,
        delivery: { error: "VRP solver failed", schedule: [] },
      };
    }
  }

  async #formatOrdersForFrontend(storeId, targetShippers) {
    const deliveryOrders = await prisma.deliveryOrder.findMany({
      where: {
        storeId,
        order: {
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PREPARING,
              OrderStatus.READY,
              OrderStatus.DELIVERING,
            ],
          },
        },
      },
      include: {
        order: {
          include: {
            customer: true,
            items: true,
          },
        },
        assignedShipper: { include: { user: true } },
      },
      orderBy: [
        { shipperId: "asc" },
        { deliverySequence: "asc" },
        { requestedAt: "asc" },
      ],
    });

    return mapper(deliveryOrders, InternalDeliveryQueueMap, {
      firstId: deliveryOrders[0]?.id,
    });
  }

  async #saveKitchenAssignments(schedule, targetChefs) {
    // Map email/phone back to Staff ID
    const staffMap = new Map();
    targetChefs.forEach((s) => {
      staffMap.set(s.user.email, s.id);
      staffMap.set(s.user.phone, s.id);
      staffMap.set(s.id, s.id);
    });

    for (const item of schedule) {
      const staffId = staffMap.get(item.PIC);
      await prisma.order.update({
        where: { id: item.OrderID },
        data: {
          chefId: staffId,
          expectedReadyAt: new Date(item.FinishedTime),
        },
      });
    }
  }

  async #saveDeliveryRoutes(schedule) {
    // Group steps by shipper to handle sequences per shipper
    const shipperSequences = new Map();

    for (const step of schedule) {
      if (step.type === "DELIVERY" && step.orderId) {
        const shipperId = step.shipperId;
        const currentSeq = (shipperSequences.get(shipperId) || 0) + 1;

        await prisma.deliveryOrder.update({
          where: { orderId: step.orderId },
          data: {
            shipperId: shipperId,
            deliverySequence: currentSeq,
          },
        });

        shipperSequences.set(shipperId, currentSeq);
      }
    }
  }

  async getDeliverySchedule(storeId, forceRefresh = false, shipperId = null) {
    console.log(
      `[KitchenService] getDeliverySchedule called for store ${storeId}. ForceRefresh: ${forceRefresh}`,
    );

    if (!forceRefresh) {
      // Fetch current state from DB
      const where = {
        storeId,
        order: {
          status: {
            in: [
              OrderStatus.READY,
              OrderStatus.DELIVERING,
              OrderStatus.PREPARING,
              OrderStatus.CONFIRMED,
            ],
          },
        },
      };

      if (shipperId) {
        where.shipperId = shipperId;
      }

      const deliveryOrders = await prisma.deliveryOrder.findMany({
        where,
        include: {
          order: true,
          assignedShipper: { include: { user: true } },
          store: true,
        },
        orderBy: [
          { shipperId: "asc" },
          { deliverySequence: "asc" },
          { requestedAt: "asc" },
        ],
      });

      console.log(
        `[KitchenService] Found ${deliveryOrders.length} delivery orders in DB.`,
      );

      if (deliveryOrders.length > 0) {
        const schedule = [];
        const uniqueShipperIds = Array.from(
          new Set(deliveryOrders.map((o) => o.shipperId)),
        );

        console.log(
          `[KitchenService] Unique shippers found: ${uniqueShipperIds.join(", ")}`,
        );

        // If no shipperId is assigned, we should force a refresh to solver
        if (uniqueShipperIds.length === 1 && uniqueShipperIds[0] === null) {
          console.log(
            "[KitchenService] No shippers assigned to orders. Triggering force refresh...",
          );
          return this.getDeliverySchedule(storeId, true, shipperId);
        }

        // Format orders for frontend @kltn-fe
        const allStaff = await staffRepository.findByStore(storeId);
        const shippers = allStaff.filter((s) => s.role === StaffRole.SHIPPER);
        const formattedOrders = await this.#formatOrdersForFrontend(
          storeId,
          shippers,
        );

        for (const sId of uniqueShipperIds) {
          if (!sId) continue;

          const shipperOrders = deliveryOrders.filter(
            (o) => o.shipperId === sId,
          );
          if (shipperOrders.length === 0) continue;

          const firstOrder = shipperOrders[0];
          const shipperName =
            firstOrder.assignedShipper?.user.name ||
            firstOrder.assignedShipper?.user.email ||
            "Unknown Shipper";

          // Add Depot Start
          schedule.push({
            shipper_id: uniqueShipperIds.indexOf(sId),
            shipperId: sId,
            shipperName,
            node: 0,
            type: "STORE",
            lat: firstOrder.store.lat,
            lng: firstOrder.store.lng,
            arrival_datetime: new Date().toISOString(),
          });

          for (const o of shipperOrders) {
            // Add Pickup
            schedule.push({
              shipper_id: uniqueShipperIds.indexOf(sId),
              shipperId: sId,
              shipperName,
              type: "PICKUP",
              orderId: o.orderId,
              orderCode: o.order.orderCode,
              lat: o.store.lat,
              lng: o.store.lng,
              arrival_datetime: o.order.expectedReadyAt?.toISOString(),
            });
            // Add Delivery
            schedule.push({
              shipper_id: uniqueShipperIds.indexOf(sId),
              shipperId: sId,
              shipperName,
              type: "DELIVERY",
              orderId: o.orderId,
              orderCode: o.order.orderCode,
              lat: o.lat,
              lng: o.lng,
              arrival_datetime: null,
            });
          }
        }
        return {
          storeId,
          numShippers: uniqueShipperIds.length,
          numOrders: deliveryOrders.length,
          schedule,
          formattedOrders,
        };
      }
    }

    // If no data or forceRefresh, trigger full unified solve
    try {
      const result = await this.getSchedule(storeId);
      return result.delivery;
    } catch (e) {
      console.warn(
        `[KitchenService] Auto-solve failed: ${e.message}. Returning empty schedule.`,
      );
      return {
        storeId,
        numShippers: 0,
        numOrders: 0,
        schedule: [],
        error: e.message,
      };
    }
  }

  async orderStoreBalance() {
    const store = await storeRepository.findAll();
  }
}

export const kitchenService = new KitchenService();
