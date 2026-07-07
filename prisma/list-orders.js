import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function listOrders() {
  const storeId = process.argv[2];
  
  try {
    const where = {};
    if (storeId) {
      where.storeId = storeId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderCode: true,
        status: true,
        type: true,
        createdAt: true,
        items: {
          select: {
            product: {
              select: {
                name: true,
                preparationTime: true
              }
            },
            quantity: true
          }
        }
      }
    });

    console.log(`📋 Found ${orders.length} orders${storeId ? ` for store ${storeId}` : ''}:`);
    console.log(JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error("❌ Error listing orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listOrders();
