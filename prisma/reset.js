import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("🧹 Xóa toàn bộ dữ liệu...\n");

  const steps = [
    ["deliveryEvent",          "DeliveryEvent"],
    ["orderItemOption",        "OrderItemOption"],
    ["orderItem",              "OrderItem"],
    ["pointTransaction",       "PointTransaction"],
    ["customerVoucher",        "CustomerVoucher"],
    ["payment",                "Payment"],
    ["voucherRedemption",      "VoucherRedemption"],
    ["deliveryOrder",          "DeliveryOrder"],
    ["order",                  "Order"],
    ["productOptionValue",     "ProductOptionValue"],
    ["productOptionGroup",     "ProductOptionGroup"],
    ["refreshToken",           "RefreshToken"],
    ["customer",               "Customer"],
    ["staff",                  "Staff"],
    ["productOption",          "ProductOption"],
    ["optionGroup",            "OptionGroup"],
    ["product",                "Product"],
    ["category",               "Category"],
    ["voucher",                "Voucher"],
    ["address",                "Address"],
    ["user",                   "User"],
    ["store",                  "Store"],
    ["auditLog",               "AuditLog"],
  ];

  let total = 0;
  for (const [model, label] of steps) {
    const { count } = await prisma[model].deleteMany({});
    if (count > 0) {
      console.log(`   ✅ ${label}: ${count}`);
      total += count;
    }
  }

  console.log(`\n✅ Đã xóa tổng cộng ${total} bản ghi.`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
