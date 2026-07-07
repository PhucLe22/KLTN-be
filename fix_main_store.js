import "dotenv/config";
import { prisma } from "./lib/prisma.js";

async function fixMainStore() {
  const storeId = "29d106ad-e5cf-405b-a8db-cd2e8438da8d";
  try {
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        address: "Landmark 81, 720A Dien Bien Phu, Binh Thanh, HCMC",
        lat: 10.795,
        lng: 106.7219
      }
    });
    console.log("✅ Main Store fixed:", updatedStore.address);
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}

fixMainStore();
