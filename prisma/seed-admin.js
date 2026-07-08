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

    // 1. Create Store for Admin in HCMC
    const store = await prisma.store.create({
      data: {
        code: "HCM_ADMIN",
        name: "Trà Sữa FoodApp - Quận 1",
        address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        lat: 10.7757,
        lng: 106.7009,
        hotline: "0900000000",
        isActive: true,
      },
    });
    console.log("✅ Store created:", store.name);

    // 2. Create User with hashed password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Quản Trị Viên",
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
