import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function seedVouchers() {
  try {
    console.log("🎟️  Starting voucher seed...");

    const stores = await prisma.store.findMany();
    if (stores.length === 0) {
      console.log("⚠️  No stores found. Run seed-manager first.");
      return;
    }

    const existingCount = await prisma.voucher.count();
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} vouchers already exist. Skipping seed.`);
      return;
    }

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const next3Months = new Date(now);
    next3Months.setMonth(next3Months.getMonth() + 3);
    const next6Months = new Date(now);
    next6Months.setMonth(next6Months.getMonth() + 6);
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - 1);

    const vouchersData = [
      {
        code: "WELCOME10",
        scope: "PUBLIC",
        discountType: "PERCENT",
        discountValue: 10,
        maxUsage: 1000,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscount: 50000,
        storeId: null,
        expiresAt: next6Months,
        isActive: true,
      },
      {
        code: "SALE50K",
        scope: "PUBLIC",
        discountType: "FIXED",
        discountValue: 50000,
        maxUsage: 500,
        usedCount: 0,
        minOrderAmount: 200000,
        maxDiscount: null,
        storeId: null,
        expiresAt: nextMonth,
        isActive: true,
      },
      {
        code: "FREESHIP",
        scope: "PUBLIC",
        discountType: "FIXED",
        discountValue: 30000,
        maxUsage: null,
        usedCount: 0,
        minOrderAmount: 100000,
        maxDiscount: null,
        storeId: null,
        expiresAt: next3Months,
        isActive: true,
      },
      {
        code: "STORE15",
        scope: "PUBLIC",
        discountType: "PERCENT",
        discountValue: 15,
        maxUsage: 200,
        usedCount: 0,
        minOrderAmount: 150000,
        maxDiscount: 100000,
        storeId: stores[0].id,
        expiresAt: nextMonth,
        isActive: true,
      },
      {
        code: "SUMMER20",
        scope: "PUBLIC",
        discountType: "PERCENT",
        discountValue: 20,
        maxUsage: 300,
        usedCount: 0,
        minOrderAmount: 300000,
        maxDiscount: 150000,
        storeId: null,
        expiresAt: next6Months,
        isActive: true,
      },
      {
        code: "VIP100K",
        scope: "CUSTOMER",
        discountType: "FIXED",
        discountValue: 100000,
        maxUsage: 1,
        usedCount: 0,
        minOrderAmount: 500000,
        maxDiscount: null,
        storeId: null,
        expiresAt: next3Months,
        isActive: true,
      },
      {
        code: "NEWUSER",
        scope: "PUBLIC",
        discountType: "PERCENT",
        discountValue: 25,
        maxUsage: 1,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscount: 50000,
        storeId: null,
        expiresAt: nextMonth,
        isActive: true,
      },
      {
        code: "STORE5K",
        scope: "PUBLIC",
        discountType: "FIXED",
        discountValue: 5000,
        maxUsage: null,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscount: null,
        storeId: stores[1].id,
        expiresAt: null,
        isActive: true,
      },
      {
        code: "MIDYEAR",
        scope: "PUBLIC",
        discountType: "PERCENT",
        discountValue: 12,
        maxUsage: 1000,
        usedCount: 0,
        minOrderAmount: 100000,
        maxDiscount: 80000,
        storeId: null,
        expiresAt: next3Months,
        isActive: true,
      },
      {
        code: "EXPIRED50",
        scope: "PUBLIC",
        discountType: "PERCENT",
        discountValue: 50,
        maxUsage: null,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscount: 200000,
        storeId: null,
        expiresAt: pastDate,
        isActive: true,
      },
    ];

    for (const data of vouchersData) {
      const voucher = await prisma.voucher.create({ data });
      console.log(`✅ Voucher created: ${voucher.code} (${voucher.discountType} ${voucher.discountValue})`);
    }

    console.log(`🎉 ${vouchersData.length} vouchers seeded successfully!`);
  } catch (error) {
    console.error("❌ Error seeding vouchers:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVouchers();
