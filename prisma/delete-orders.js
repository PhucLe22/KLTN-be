import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const STORE_ID = "3c7a4a4f-e551-4344-8bab-2086262274ff";

async function main() {
  console.log("🧹 Deleting all orders for store:", STORE_ID);
  
  // Need to delete in correct order due to foreign keys: OrderItem, Payment, DeliveryOrder, Order
  
  // 1. Delete OrderItems
  await prisma.orderItem.deleteMany({ where: { order: { storeId: STORE_ID } } });
  
  // 2. Delete Payments
  await prisma.payment.deleteMany({ where: { order: { storeId: STORE_ID } } });
  
  // 3. Delete DeliveryOrders
  await prisma.deliveryOrder.deleteMany({ where: { storeId: STORE_ID } });
  
  // 4. Delete Orders
  const deletedOrders = await prisma.order.deleteMany({ where: { storeId: STORE_ID } });
  
  console.log(`✅ Deleted ${deletedOrders.count} orders and related records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
