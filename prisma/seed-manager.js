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

    // 1. Create Stores
    const storesData = [
      { code: "HCM_BINH_THANH", name: "Binh Thanh Store", address: "720A Dien Bien Phu, Binh Thanh, HCMC", lat: 10.7950, lng: 106.7219, hotline: "0901234567", isActive: true },
      { code: "HCM_DIST1", name: "District 1 Store", address: "123 Nguyen Hue, District 1, HCMC", lat: 10.7757, lng: 106.7009, hotline: "0901234568", isActive: true },
      { code: "HCM_DIST7", name: "District 7 Store", address: "456 Nguyen Van Linh, District 7, HCMC", lat: 10.7300, lng: 106.7100, hotline: "0901234569", isActive: true },
    ];
    
    const stores = [];
    for (const data of storesData) {
        const store = await prisma.store.create({ data });
        stores.push(store);
        console.log("✅ Store created:", store.name);
    }

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

    // 3. Create Staff with MANAGER role (assigned to the first store)
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        storeId: stores[0].id,
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
