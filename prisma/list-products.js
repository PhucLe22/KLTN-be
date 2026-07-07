import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function listProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        basePrice: true,
        isActive: true,
        categoryId: true,
        preparationTime: true,
      },
    });

    console.log("📋 Products in database:");
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("❌ Error listing products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listProducts();
