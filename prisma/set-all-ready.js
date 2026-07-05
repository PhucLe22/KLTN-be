import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("📦 Setting all orders to READY status...");

  const { count } = await prisma.order.updateMany({
    where: { status: { not: "READY" } },
    data: { status: "READY" },
  });

  console.log(`✅ Updated ${count} orders to READY.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
