import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        staff: { include: { store: true } },
        customer: true,
      },
    });

    console.log("📋 Users in database:");
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("❌ Error listing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
