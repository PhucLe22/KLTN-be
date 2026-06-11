import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("--- STORES ---");
  const stores = await prisma.store.findMany({
    select: { id: true, code: true, name: true }
  });
  console.log(JSON.stringify(stores, null, 2));

  console.log("\n--- STAFF ROLES ---");
  const staff = await prisma.staff.findMany({
    include: {
      user: { select: { email: true } },
      store: { select: { code: true } }
    }
  });
  staff.forEach(s => {
    console.log(`User: ${s.user.email} | Role: ${s.role} | Store: ${s.store.code} (${s.storeId})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
