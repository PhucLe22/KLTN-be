import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function seedManager() {
  try {
    console.log("🌱 Starting manager seed...");

    // Check if manager already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "manager@foodapp.com" },
    });

    if (existingUser) {
      console.log("⚠️  Manager account already exists. Skipping seed.");
      return;
    }

    // 1. Create Store (required for Staff)
    const store = await prisma.store.create({
      data: {
        code: "MAIN",
        name: "Main Store",
        address: "720A Dien Bien Phu, Binh Thanh, HCMC",
        lat: 10.7950,
        lng: 106.7219,
        hotline: "0901234567",
        isActive: true,
      },
    });
    console.log("✅ Store created:", store.name);

    // 2. Create User with hashed password
    const hashedPassword = await bcrypt.hash("manager123", 10);
    const user = await prisma.user.create({
      data: {
        email: "manager@foodapp.com",
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log("✅ User created:", user.email);

    // 3. Create Staff with MANAGER role
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        storeId: store.id,
        role: "MANAGER",
        isActive: true,
      },
    });
    console.log("✅ Staff created with role:", staff.role);

    console.log("🎉 Manager account seeded successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: manager@foodapp.com");
    console.log("   Password: manager123");
  } catch (error) {
    console.error("❌ Error seeding manager:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedManager();
