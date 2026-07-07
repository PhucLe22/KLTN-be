import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("🧹 Deleting ALL orders and related records across the entire network...");
  
  // Need to delete in correct order due to foreign keys: OrderItem, Payment, DeliveryOrder, Order
  
  // 1. Delete OrderItems
  const orderItems = await prisma.orderItem.deleteMany({});
  console.log(`- Deleted ${orderItems.count} order items.`);
  
  // 2. Delete Payments
  const payments = await prisma.payment.deleteMany({});
  console.log(`- Deleted ${payments.count} payments.`);
  
  // 3. Delete DeliveryOrders
  const deliveryOrders = await prisma.deliveryOrder.deleteMany({});
  console.log(`- Deleted ${deliveryOrders.count} delivery orders.`);
  
  // 4. Delete Orders
  const orders = await prisma.order.deleteMany({});
  console.log(`- Deleted ${orders.count} orders.`);
  
  console.log(`✅ Clean slate achieved. Network-wide orders cleared.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
