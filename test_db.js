import { prisma } from './lib/prisma.js';

async function test() {
  try {
    const stores = await prisma.store.findMany({ take: 1 });
    console.log("Connection successful, found stores:", stores.length);
  } catch (e) {
    console.error("Connection failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
