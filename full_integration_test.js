import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import axios from "axios";
import bcrypt from "bcrypt";
import { JwtHelper } from "./lib/jwt.js";
import { OrderStatus, OrderType, StaffRole } from "./constants/enum.js";

async function runIntegrationTest() {
  console.log("🚦 Starting Full Backend-to-Solver Integration Test...");

  try {
    // 1. Setup Test Data (Store)
    const store = await prisma.store.upsert({
      where: { code: "TEST_STORE" },
      update: { lat: 10.7757, lng: 106.7009 },
      create: {
        code: "TEST_STORE",
        name: "Integration Test Store",
        address: "123 Test St, District 1, HCM",
        hotline: "0999888777",
        lat: 10.7757,
        lng: 106.7009,
      },
    });
    console.log("✅ Store ready:", store.code);

    // 2. Setup Staff
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Manager
    const managerUser = await prisma.user.upsert({
      where: { email: "test_manager@foodapp.com" },
      update: {},
      create: {
        email: "test_manager@foodapp.com",
        password: hashedPassword,
        staff: { create: { storeId: store.id, role: StaffRole.MANAGER } }
      },
      include: { staff: true }
    });

    // Kitchen Staff
    await prisma.user.upsert({
      where: { email: "test_chef@foodapp.com" },
      update: {},
      create: {
        email: "test_chef@foodapp.com",
        password: hashedPassword,
        staff: { create: { storeId: store.id, role: StaffRole.KITCHEN } }
      }
    });

    // Shipper
    await prisma.user.upsert({
      where: { email: "test_shipper@foodapp.com" },
      update: {},
      create: {
        email: "test_shipper@foodapp.com",
        password: hashedPassword,
        staff: { create: { storeId: store.id, role: StaffRole.SHIPPER } }
      }
    });
    console.log("✅ Staff (Manager, Chef, Shipper) ready.");

    // 3. Setup Customer & Order
    const customer = await prisma.customer.upsert({
      where: { phone: "0911222333" },
      update: {},
      create: { phone: "0911222333", name: "Test Customer" }
    });

    const product = await prisma.product.findFirst();
    if (!product) throw new Error("No products found in DB. Run seed first.");

    const order = await prisma.order.create({
      data: {
        orderCode: `TEST-${Date.now()}`,
        storeId: store.id,
        customerId: customer.id,
        type: OrderType.DELIVERY,
        status: OrderStatus.CONFIRMED, // Start as confirmed to be picked up by solver
        subtotal: 50000,
        total: 65000,
        serviceFee: 15000,
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
            storeId: store.id,
            receiverName: "Integration Test",
            receiverPhone: "0911222333",
            addressLine: "789 Landmark 81, Binh Thanh, HCM",
            lat: 10.795, // Manually set to avoid geocoding latency
            lng: 106.721
          }
        }
      }
    });
    console.log("✅ Order created and CONFIRMED:", order.orderCode);

    // 4. Generate Token for Manager
    const token = JwtHelper.generateAccessToken({
      sub: managerUser.id,
      type: "STAFF",
      role: managerUser.staff.role,
      sid: managerUser.staff.id,
      storeId: managerUser.staff.storeId,
    });

    // 5. Trigger Backend Scheduling API
    console.log("📡 Calling Backend /schedule API...");
    const response = await axios.post(
      "http://localhost:5001/api/v1/internal/kitchen/schedule",
      { tardiness_weight: 1000 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const result = response.data.data;
    console.log("\n--- INTEGRATION TEST RESULTS ---");
    
    // Orders Assigned
    console.log("\n[KITCHEN ASSIGNMENTS]");
    result.kitchen.schedule.forEach(item => {
      console.log(`- Order ${item.OrderID}: Assigned to ${item.PIC} | Expected Ready: ${item.FinishedTime}`);
    });

    // Shipper Routes
    console.log("\n[SHIPPER ROUTES]");
    if (result.delivery.schedule.length > 0) {
        result.delivery.schedule.forEach(step => {
            const nodeInfo = step.type === 'STORE' ? '🏪 STORE' : (step.type === 'PICKUP' ? `📦 PICKUP (${step.orderCode})` : `📍 DELIVERY (${step.orderCode})`);
            console.log(`- Shipper ${step.shipperName}: ${nodeInfo} at ${step.arrival_datetime}`);
        });
    }

    // Formatted Orders for Frontend
    console.log("\n[FORMATTED ORDERS FOR FRONTEND]");
    if (result.delivery.formattedOrders && result.delivery.formattedOrders.length > 0) {
        result.delivery.formattedOrders.forEach(o => {
            console.log(`- [${o.status}] ${o.id}: ${o.customer} | ${o.address} | Items: ${o.items}`);
            console.log(`  Location: ${o.location.lat}, ${o.location.lng} | Focused: ${o.isFocused}`);
        });
    } else {
        console.log("- No formatted orders generated.");
    }

    console.log("\n🎉 Full Integration Test Completed Successfully!");

  } catch (error) {
    console.error("\n❌ Integration Test Failed!");
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error(error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrationTest();
