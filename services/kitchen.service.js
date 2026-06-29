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

  async getSchedule(storeIds, tardinessWeight = 1000) {
    if (!Array.isArray(storeIds)) {
      storeIds = [storeIds];
    }
    console.log(
      `[KitchenService] Triggering unified solver for stores ${storeIds.join(", ")}...`,
    );

    // 1. Get all staff and categorize
    const allStaff = await staffRepository.findByStores(storeIds);
    if (allStaff.length === 0) {
      throw ERR.BadRequest("No staff available in these stores");
    }

    const shippers = allStaff.filter((s) => s.role === StaffRole.SHIPPER);
    const chefs = allStaff.filter((s) => s.role === StaffRole.KITCHEN);

    // For kitchen scheduling, we keep it store-specific by grouping chefs
    const targetChefs = chefs.length > 0 ? chefs : allStaff;
    const chefNames = targetChefs.map(
      (s) => s.user.email || s.user.phone || s.id,
    );
    const targetShippers = shippers.length > 0 ? shippers : allStaff;

    // 2. Get orders for Kitchen Schedule (CONFIRMED & PREPARING)
    const deliveryOrders = await prisma.deliveryOrder.findMany({
      where: {
        OR: [
          { storeId: { in: storeIds } },
          { storeId: null }
        ],
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
            customer: true, // ADD THIS
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
      console.log("[KitchenService] Sending payload...");
      console.log(JSON.stringify(kitchenPayload));
      const response = await axios.post(
        `${this.pythonBackendUrl}/schedule`,
        kitchenPayload,
        { timeout: 60000 }
      );
      kitchenResult = response.data;
      console.log("[KitchenService] Phase 3 Completed: Kitchen Solver returned results.");

      // PERSIST Kitchen Results
      await this.#saveKitchenAssignments(kitchenResult.schedule, targetChefs);
      console.log("[KitchenService] Phase 3: Kitchen assignments persisted.");
    } catch (error) {
      if (error.response) {
         console.error("❌ Solver API Error Response:", JSON.stringify(error.response.data, null, 2));
         console.error("❌ Solver API Status Code:", error.response.status);
      } else {
         console.error("❌ Solver API Error (No response):", error.message);
      }
      throw ERR.BadRequest("Failed to get kitchen schedule from solver. Check backend logs.");
    }

    // 4. Get orders for Delivery Routing (READY)
    console.log("[KitchenService] Phase 4: Fetching READY orders for routing...");
    const deliveryOrdersForRouting = await prisma.deliveryOrder.findMany({
      where: {
        OR: [
          { storeId: { in: storeIds } },
          { storeId: null }
        ],
        order: {
          status: OrderStatus.READY,
        },
      },
      include: {
        order: {
          include: {
            customer: true, // MUST INCLUDE
          },
        },
        store: true,
      },
    });
    console.log(`[KitchenService] Phase 4: Found ${deliveryOrdersForRouting.length} READY orders.`);

    // 5. Combine READY and predicted DELIVERY orders
    console.log("[KitchenService] Phase 5: Combining READY and predicted orders...");
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
            // Re-fetch delivery with customer relation if needed
            const deliveryWithCustomer = await prisma.deliveryOrder.findUnique({
              where: { id: order.delivery.id },
              include: { order: { include: { customer: true } } }
            });
            ordersForRouting.push(deliveryWithCustomer);
          }
        }
      }
    }

    const uniqueOrdersForRouting = Array.from(
      new Map(ordersForRouting.map((o) => [o.id, o])).values(),
    );
    console.log(`[KitchenService] Phase 5: Total unique orders for routing: ${uniqueOrdersForRouting.length}`);

    if (uniqueOrdersForRouting.length === 0) {
      console.log("[KitchenService] Phase 5: No orders for routing. Returning kitchen results only.");
      return { kitchen: kitchenResult, delivery: { schedule: [] } };
    }

    // 6. Build VRP
    console.log("[KitchenService] Phase 6: Starting VRP Data Construction...");
    const stores = await storeRepository.findByIds(storeIds);
    const storeMap = new Map(stores.map((s) => [s.id, s]));

    // Ensure all stores have coordinates
    for (const store of stores) {
      if (!store.lat || !store.lng) {
        console.log(`[KitchenService] Phase 6: Geocoding store ${store.name || store.id}...`);
        const geo = await geocodeAddress(store.address);
        await storeRepository.update(store.id, { lat: geo.lat, lng: geo.lng });
        store.lat = geo.lat;
        store.lng = geo.lng;
      }
    }

    const locations = [];
    // Assume depot is the first store for now or a central location.
    // Given the solver uses node 0 as start/end, let's use the first store as depot
    locations.push({ lat: stores[0].lat, lng: stores[0].lng });

    const orderIdMap = [];
    const now = new Date();

    console.log(`[KitchenService] Phase 6: Processing ${uniqueOrdersForRouting.length} delivery locations...`);
    for (const deliveryOrder of uniqueOrdersForRouting) {
      if (!deliveryOrder.addressLine) continue;
      try {
        let orderLat = deliveryOrder.lat;
        let orderLng = deliveryOrder.lng;

        if (!orderLat || !orderLng) {
          console.log(`[KitchenService] Phase 6: Geocoding order address: ${deliveryOrder.addressLine}`);
          const geo = await geocodeAddress(deliveryOrder.addressLine);
          orderLat = geo.lat;
          orderLng = geo.lng;
          // Save geocoded coords back to DeliveryOrder for future use
          await prisma.deliveryOrder.update({
            where: { id: deliveryOrder.id },
            data: { lat: orderLat, lng: orderLng },
          });
        }

        let store = storeMap.get(deliveryOrder.storeId);
        
        // Dynamic store assignment if null
        if (!store) {
           // Find closest store to delivery address
           let minDistance = Infinity;
           for (const s of stores) {
               const dist = Math.sqrt((s.lat - orderLat)**2 + (s.lng - orderLng)**2);
               if (dist < minDistance) {
                   minDistance = dist;
                   store = s;
               }
           }
           
           // Update deliveryOrder with assigned storeId
           if (store) {
               await prisma.deliveryOrder.update({
                   where: { id: deliveryOrder.id },
                   data: { storeId: store.id }
               });
               await prisma.order.update({
                   where: { id: deliveryOrder.orderId },
                   data: { storeId: store.id }
               });
           }
        }
        
        if (!store) continue;

        locations.push({ lat: store.lat, lng: store.lng }); // Pickup Node
        locations.push({ lat: orderLat, lng: orderLng }); // Delivery Node

        const readyAt = deliveryOrder.order?.expectedReadyAt || now;
        const pickupOffset = Math.max(0, Math.round((readyAt - now) / 60000));

        orderIdMap.push({
          id: deliveryOrder.orderId,
          orderCode: deliveryOrder.order?.orderCode || "N/A",
          pickupOffset,
          customerName: deliveryOrder.order?.customer?.name || (console.log("[DEBUG] Missing customer name for:", deliveryOrder.orderId) || "Unknown"),
          customerPhone: deliveryOrder.order?.customer?.phone || (console.log("[DEBUG] Missing customer phone for:", deliveryOrder.orderId) || "Unknown"),
          address: deliveryOrder.addressLine || "Unknown",
        });
      } catch (e) {
        console.warn(
          `[KitchenService] Geocode fail for ${deliveryOrder.order?.orderCode || "N/A"}: ${e.message}`,
        );
      }
    }

    if (orderIdMap.length === 0) {
      console.log("[KitchenService] Phase 6: No valid order locations. Skipping VRP.");
      return { kitchen: kitchenResult, delivery: { schedule: [] } };
    }

    console.log(`[KitchenService] Phase 6: Requesting route matrix for ${locations.length} nodes...`);
    const matrixData = await getRouteMatrix(locations);
    console.log("[KitchenService] Phase 6: Route matrix received.");
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
      vehicle_capacities: new Array(targetShippers.length).fill(3), // Reasonable capacity
      time_windows: timeWindows,
    };

    try {
      const vrpResponse = await axios.post(
        `${this.pythonBackendUrl}/vrp`,
        vrpPayload,
        { timeout: 30000 } // 30s timeout
      );
      console.log(
        `[KitchenService] VRP returned ${vrpResponse.data.length} steps.`,
      );

      const shipperNodeCounters = {};
      const deliverySchedule = vrpResponse.data.map((entry) => {
        const node = entry.node;
        const location = locations[node];
        const res = {
          ...entry,
          type: "STORE",
          status: "PENDING", // Added
          orderId: null,
          orderCode: null,
          lat: location.lat,
          lng: location.lng,
          storeId: stores[0].id, // Depot store ID
          storeName: stores[0].name, // Default to depot store name
          storeAddress: stores[0].address,
        };
        if (node > 0) {
          const isPickup = node % 2 !== 0;
          const idx = isPickup ? (node + 1) / 2 - 1 : node / 2 - 1;
          const o = orderIdMap[idx];
          res.type = isPickup ? "STORE" : "DELIVERY";
          res.orderId = o.id;
          res.orderCode = o.orderCode;
          res.customerName = o.customerName;
          res.customerPhone = o.customerPhone;
          res.address = o.address;

          if (isPickup) {
            // Find the specific store for this order
            const orderDelivery = uniqueOrdersForRouting.find(d => d.orderId === o.id);
            const specificStore = storeMap.get(orderDelivery?.storeId);
            if (specificStore) {
              res.storeId = specificStore.id;
              res.storeName = specificStore.name;
              res.storeAddress = specificStore.address;
            }
          }
        }
        const shipper = targetShippers[entry.shipper_id];
        if (shipper) {
          res.shipperId = shipper.id;
          res.shipperName =
            shipper.user.name || shipper.user.email || shipper.id;
        }

        // Add sequential node number per shipper and remove redundant shipper_id
        const sId = res.shipperId || "unknown";
        if (shipperNodeCounters[sId] === undefined) {
          shipperNodeCounters[sId] = 0;
        }
        res.node = shipperNodeCounters[sId]++;
        delete res.shipper_id;

        return res;
      });

      // PERSIST VRP Results
      await this.#saveDeliveryRoutes(deliverySchedule);

      const formattedOrders = await this.#formatOrdersForFrontend(
        storeIds,
        targetShippers,
      );

      // Group by shipper
      const shippersMap = new Map();
      deliverySchedule.forEach((step) => {
        const sId = step.shipperId || "unknown";
        if (!shippersMap.has(sId)) {
          shippersMap.set(sId, {
            shipperId: sId,
            shipperName: step.shipperName || "Unknown Shipper",
            routes: [],
          });
        }
        const { shipperId, shipperName, ...routeData } = step;
        shippersMap.get(sId).routes.push(routeData);
      });

      return {
        kitchen: kitchenResult,
        delivery: {
          numShippers: targetShippers.length,
          numOrders: orderIdMap.length,
          shippers: Array.from(shippersMap.values()),
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

  async #formatOrdersForFrontend(storeIds, targetShippers) {
    if (!Array.isArray(storeIds)) {
      storeIds = [storeIds];
    }
    const deliveryOrders = await prisma.deliveryOrder.findMany({
      where: {
        storeId: { in: storeIds },
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
    // Group steps by shipper to handle sequences and full route persistence
    const shipperSequences = new Map();
    const shipperRoutes = new Map();

    for (const step of schedule) {
      const shipperId = step.shipperId;
      if (!shipperId || shipperId === "unknown") continue;

      // 1. Accumulate full route for JSON persistence
      if (!shipperRoutes.has(shipperId)) {
        shipperRoutes.set(shipperId, []);
      }
      
      // Map order details to the route steps if not already present
      const stepWithDetails = { ...step };
      if (step.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: step.orderId },
          include: { items: true }
        });
        if (order) {
            stepWithDetails.items = order.items;
            stepWithDetails.total = order.total;
        }
      }
      
      shipperRoutes.get(shipperId).push(stepWithDetails);

      // 2. Handle individual order updates (sequence)
      if (step.type === "DELIVERY" && step.orderId) {
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

    // 3. Persist full route JSON per shipper
    for (const [sId, routeSteps] of shipperRoutes.entries()) {
      await prisma.deliveryRoute.upsert({
        where: { shipperId: sId },
        update: {
          route: routeSteps,
          updatedAt: new Date(),
        },
        create: {
          shipperId: sId,
          route: routeSteps,
        },
      });
    }
  }

  async getDeliverySchedule(storeIds, forceRefresh = false, shipperId = null) {
    if (storeIds && !Array.isArray(storeIds)) {
      storeIds = [storeIds];
    }
    console.log(
      `[KitchenService] getDeliverySchedule called for ${storeIds ? `stores ${storeIds.join(", ")}` : "all stores"}. ForceRefresh: ${forceRefresh}, Shipper: ${shipperId || "Global"}`,
    );

    if (!forceRefresh) {
      // Fetch current state from DB
      const where = {
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

      if (storeIds) {
        where.storeId = { in: storeIds };
      }

      if (shipperId) {
        where.shipperId = shipperId;
      }

      const deliveryOrders = await prisma.deliveryOrder.findMany({
        where,
        include: {
          order: {
            include: {
              customer: true,
            },
          },
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
        const uniqueShipperIds = Array.from(
          new Set(deliveryOrders.map((o) => o.shipperId)),
        );

        console.log(
          `[KitchenService] Unique shippers found: ${uniqueShipperIds.join(", ")}`,
        );

        // If no shippers assigned to ANY order, force a refresh
        if (uniqueShipperIds.length === 1 && uniqueShipperIds[0] === null) {
          console.log(
            "[KitchenService] No shippers assigned to orders. Triggering force refresh...",
          );
          const targetStoreIds = storeIds || Array.from(new Set(deliveryOrders.map(o => o.storeId)));
          return this.getDeliverySchedule(targetStoreIds, true, shipperId);
        }

        // Fetch persisted routes for assigned shippers
        const assignedShipperIds = uniqueShipperIds.filter(id => id !== null);
        const persistedRoutes = await prisma.deliveryRoute.findMany({
          where: { shipperId: { in: assignedShipperIds } }
        });
        const routeMap = new Map(persistedRoutes.map(r => [r.shipperId, r.route]));

        // Format orders for frontend queue
        const displayStoreIds = storeIds || Array.from(new Set(deliveryOrders.map(o => o.storeId)));
        const allStaff = await staffRepository.findByStores(displayStoreIds);
        const shippers = allStaff.filter((s) => s.role === StaffRole.SHIPPER);
        const formattedOrders = await this.#formatOrdersForFrontend(
          displayStoreIds,
          shippers,
        );

        const shippersList = [];
        for (const sId of uniqueShipperIds) {
          if (!sId) continue;

          const shipperOrders = deliveryOrders.filter((o) => o.shipperId === sId);
          if (shipperOrders.length === 0) continue;

          // 1. Try to use persisted route
          if (routeMap.has(sId)) {
            const savedRoute = routeMap.get(sId);
            // Optional: Validate if savedRoute still matches current orders
            shippersList.push({
              shipperId: sId,
              shipperName: shipperOrders[0].assignedShipper?.user.name || "Unknown Shipper",
              routes: savedRoute,
              isPersisted: true
            });
            continue;
          }

          // 2. Fallback: Manual reconstruction if no persisted route found
          const firstOrder = shipperOrders[0];
          const shipperName =
            firstOrder.assignedShipper?.user.name ||
            firstOrder.assignedShipper?.user.email ||
            "Unknown Shipper";

          let nodeCounter = 0;
          const routes = [];

          // Add Depot Start
          routes.push({
            node: nodeCounter++,
            type: "STORE",
            status: "PENDING", // Added
            lat: firstOrder.store.lat,
            lng: firstOrder.store.lng,
            storeId: firstOrder.store.id,
            storeName: firstOrder.store.name,
            storeAddress: firstOrder.store.address,
            arrival_datetime: new Date().toISOString(),
          });

          for (const o of shipperOrders) {
            // Add Pickup
            routes.push({
              node: nodeCounter++,
              type: "STORE",
              status: "PENDING", // Added
              orderId: o.orderId,
              orderCode: o.order.orderCode,
              customerName: o.order.customer?.name || "Unknown",
              customerPhone: o.order.customer?.phone || "Unknown",
              address: o.addressLine || "Unknown",
              lat: o.store.lat,
              lng: o.store.lng,
              storeId: o.store.id,
              storeName: o.store.name,
              storeAddress: o.store.address,
              arrival_datetime: o.order.expectedReadyAt?.toISOString(),
              
              // New details for shipper
              items: o.order.items,
              total: o.order.total,
            });
            // Add Delivery
            routes.push({
              node: nodeCounter++,
              type: "DELIVERY",
              status: "PENDING", // Added
              orderId: o.orderId,
              orderCode: o.order.orderCode,
              customerName: o.order.customer?.name || "Unknown",
              customerPhone: o.order.customer?.phone || "Unknown",
              address: o.addressLine || "Unknown",
              lat: o.lat,
              lng: o.lng,
              arrival_datetime: null,

              // New details for shipper
              items: o.order.items,
              total: o.order.total,
            });
          }
          shippersList.push({
            shipperId: sId,
            shipperName,
            routes,
            isPersisted: false
          });
        }
        return {
          numShippers: uniqueShipperIds.length,
          numOrders: deliveryOrders.length,
          shippers: shippersList,
          formattedOrders,
        };
      }
    }

    // If no data or forceRefresh, trigger full unified solve
    try {
      // If we don't have storeIds here, we fetch all active stores as a fallback
      const targetStoreIds = storeIds || await storeRepository.getAllActiveStoreIds();
      const result = await this.getSchedule(targetStoreIds);
      return result.delivery;
    } catch (e) {
      console.warn(
        `[KitchenService] Auto-solve failed: ${e.message}. Returning empty schedule.`,
      );
      return {
        storeIds,
        numShippers: 0,
        numOrders: 0,
        shippers: [],
        error: e.message,
      };
    }
  }

  async orderStoreBalance() {
    const store = await storeRepository.findAll();
  }
}

export const kitchenService = new KitchenService();
