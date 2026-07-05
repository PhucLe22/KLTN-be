import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function seedStaff() {
  try {
    console.log("🌱 Starting staff and shipper seed...");

    // 1. Get the Main Store
    let store = await prisma.store.findUnique({
      where: { code: "MAIN" },
    });

    if (!store) {
      console.log("⚠️ Cửa hàng chính không tồn tại. Đang tạo...");
      store = await prisma.store.create({
        data: {
          code: "MAIN",
          name: "Cửa Hàng Chính",
          address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
          hotline: "0901234567",
          isActive: true,
          lat: 10.7757,
          lng: 106.7009
        },
      });
    }

    const staffMembers = [
      {
        email: "kitchen1@foodapp.com",
        name: "Đầu Bếp Một",
        role: "KITCHEN",
        password: "password123",
      },
      {
        email: "kitchen2@foodapp.com",
        name: "Đầu Bếp Hai",
        role: "KITCHEN",
        password: "password123",
      },
      {
        email: "shipper1@foodapp.com",
        name: "Giao Hàng Một",
        role: "SHIPPER",
        password: "password123",
      },
      {
        email: "shipper2@foodapp.com",
        name: "Giao Hàng Hai",
        role: "SHIPPER",
        password: "password123",
      },
    ];

    for (const member of staffMembers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: member.email },
      });

      if (existingUser) {
        console.log(`⚠️ User ${member.email} already exists. Skipping.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(member.password, 10);
      const user = await prisma.user.create({
        data: {
          email: member.email,
          name: member.name,
          password: hashedPassword,
          isActive: true,
          staff: {
            create: {
              storeId: store.id,
              role: member.role,
              isActive: true,
            },
          },
        },
      });
      console.log(`✅ Created ${member.role}: ${user.email}`);
    }

    console.log("🎉 Staff and shipper seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding staff:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedStaff();
