import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import axios from "axios";
import { StaffRole } from "./constants/enum.js";
import { JwtHelper } from "./lib/jwt.js";

async function runSolverTest() {
  console.log("🚦 Starting Solver Assignment Test (15 Seeded Orders)...");

  try {
    // 1. Get Manager/Store for token
    const staff = await prisma.staff.findFirst({
        where: { role: StaffRole.MANAGER },
        include: { user: true }
    });
    
    if (!staff) throw new Error("Manager not found. Seed again.");

    // 2. Trigger solver manually
    console.log("📡 Triggering solver API...");
    const token = JwtHelper.generateAccessToken({
      sub: staff.userId,
      type: "STAFF",
      role: staff.role,
      sid: staff.id,
      storeId: staff.storeId,
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
            console.error("❌ Solver API Error Status:", solverError.response.status);
        } else {
            console.error("❌ Solver API Error (No response):", solverError.message);
        }
        throw solverError;
    }

    // 3. Verify assignment for all orders
    const orders = await prisma.order.findMany({
      where: { type: 'DELIVERY' },
      include: { delivery: true }
    });

    console.log(`\n--- VERIFICATION RESULTS (${orders.length} orders found) ---`);
    let allAssigned = true;
    orders.forEach((o, index) => {
        const assigned = o.storeId !== null && o.delivery.storeId !== null && o.chefId !== null && o.delivery.shipperId !== null;
        if (!assigned) allAssigned = false;
        console.log(`- Order ${index+1} (${o.orderCode}): Store: ${o.storeId ? 'Yes' : 'No'}, Chef: ${o.chefId ? 'Yes' : 'No'}, Shipper: ${o.delivery.shipperId ? 'Yes' : 'No'}`);
    });

    if (allAssigned) {
        console.log("🎉 SUCCESS: Solver correctly assigned all orders!");
    } else {
        console.log("❌ FAILED: Solver did not assign all orders.");
    }

  } catch (error) {
    console.error("\n❌ Test Failed!", error.message);
    if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

runSolverTest();
