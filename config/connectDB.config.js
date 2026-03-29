import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { PrismaClient } = prismaPkg;

const connectDB = async () => {
  try {
    const adapter = new PrismaPg(
      new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    );
    const prisma = new PrismaClient({
      adapter,
    });
    await prisma.$connect();
    console.log("PostgreSQL connected successfully");

    return prisma;
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error.message);
    process.exit(1);
  }
};

export default connectDB;
