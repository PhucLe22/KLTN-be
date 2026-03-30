import { prisma } from "../lib/prisma.js";

const connectToDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully via Prisma Adapter!");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

export default connectToDB;
