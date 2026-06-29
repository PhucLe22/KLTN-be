import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import axios from "axios";
import { OrderStatus, OrderType, StaffRole } from "./constants/enum.js";
import { JwtHelper } from "./lib/jwt.js";
import bcrypt from "bcrypt";

async function runDeliveryFlowTest() {
  console.log("🚦 Starting Delivery Flow: Create (Null Store) -> Solver Assignment Test...");

  try {
    // 1. Setup Test Data (Store)
    const store = await prisma.store.upsert({
      where: { code: "TEST_STORE_A" },
      update: { lat: 10.7757, lng: 106.7009 },
      create: {
        code: "TEST_STORE_A",
        name: "Test Store A",
        address: "123 Test St, District 1, HCM",
        hotline: "0999888777",
        lat: 10.7757,
        lng: 106.7009,
      },
    });
    
    // Setup Manager
    const hashedPassword = await bcrypt.hash("password123", 10);
    const managerUser = await prisma.user.upsert({
      where: { email: "test_manager_delivery@foodapp.com" },
      update: {},
      create: {
        email: "test_manager_delivery@foodapp.com",
        password: hashedPassword,
        staff: { create: { storeId: store.id, role: StaffRole.MANAGER } }
      },
      include: { staff: { include: { store: true } } }
    });
    
    console.log("✅ Store and Manager ready.");

    // 2. Create 15 DELIVERY Orders with null storeId
    console.log("📝 Creating 15 DELIVERY orders with null storeId...");
    const product = await prisma.product.findFirst();
    const customer = await prisma.customer.upsert({
      where: { phone: "0911222999" },
      update: {},
      create: { phone: "0911222999", name: "Test Customer Delivery" }
    });

    const orderIds = [];
    for (let i = 0; i < 15; i++) {
        const order = await prisma.order.create({
          data: {
            orderCode: `DELIV-${Date.now()}-${i}`,
            // storeId: null is implicit
            customerId: customer.id,
            type: OrderType.DELIVERY,
            status: OrderStatus.CONFIRMED,
            subtotal: 50000,
            total: 65000,
            items: {
              create: [{
                productId: product.id,
                name: product.name,
                price: product.basePrice,
                quantity: 1
              }]
            },
            delivery: {
              create: {
                receiverName: `Delivery Test ${i}`,
                receiverPhone: "0911222999",
                addressLine: "789 Landmark 81, Binh Thanh, HCM",
              }
            }
          },
          include: { delivery: true }
        });
        orderIds.push(order.id);
    }
    console.log(`✅ Created 15 orders.`);

    // 3. Trigger solver manually
    console.log("📡 Triggering solver API...");
    const token = JwtHelper.generateAccessToken({
      sub: managerUser.id,
      type: "STAFF",
      role: managerUser.staff.role,
      sid: managerUser.staff.id,
      storeId: managerUser.staff.storeId,
    });
    
    // Call the network-wide solve
    try {
        await axios.post(
          "http://localhost:5001/api/v1/internal/kitchen/solve-network",
          { tardiness_weight: 1000 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Solver triggered successfully.");
    } catch (solverError) {
        if (solverError.response) {
            console.error("❌ Solver API Error Response:", JSON.stringify(solverError.response.data, null, 2));
        }
        throw solverError;
    }

    // 4. Verify assignment for all orders
    const updatedOrders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { delivery: true }
    });

    console.log("\n--- VERIFICATION RESULTS ---");
    let allAssigned = true;
    updatedOrders.forEach((o, index) => {
        const assigned = o.storeId !== null && o.delivery.storeId !== null && o.chefId !== null && o.delivery.shipperId !== null;
        if (!assigned) allAssigned = false;
        console.log(`- Order ${index+1} (${o.orderCode}): Store: ${o.storeId ? 'Yes' : 'No'}, Chef: ${o.chefId ? 'Yes' : 'No'}, Shipper: ${o.delivery.shipperId ? 'Yes' : 'No'}`);
    });

    if (allAssigned) {
        console.log("🎉 SUCCESS: Solver correctly assigned all 15 orders!");
    } else {
        console.log("❌ FAILED: Solver did not assign all orders.");
    }

  } catch (error) {
    console.error("\n❌ Test Failed!", error.message);
    if (error.response) console.error(error.response.data);
  } finally {
    await prisma.$disconnect();
  }
}

runDeliveryFlowTest();
