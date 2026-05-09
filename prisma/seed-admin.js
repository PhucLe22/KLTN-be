import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function seedAdmin() {
  try {
    console.log("🌱 Starting admin seed...");

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@foodapp.com" },
    });

    if (existingUser) {
      console.log("⚠️  Admin account already exists. Skipping seed.");
      return;
    }

    // 1. Create System Store for Admin (optional, but staff requires storeId)
    const store = await prisma.store.create({
      data: {
        code: "SYSTEM",
        name: "System Store",
        address: "System Headquarters",
        hotline: "0900000000",
        isActive: true,
      },
    });
    console.log("✅ System Store created:", store.name);

    // 2. Create User with hashed password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.create({
      data: {
        email: "admin@foodapp.com",
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log("✅ User created:", user.email);

    // 3. Create Staff with ADMIN role
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        storeId: store.id,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log("✅ Staff created with role:", staff.role);

    console.log("🎉 Admin account seeded successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@foodapp.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
