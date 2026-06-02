import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting master seed process...");

  const seedFiles = [
    "seed-option-groups.js",
    "seed-products.js",
    "seed-admin.js",
    "seed-manager.js",
    "update-preparation-time.js"
  ];

  for (const file of seedFiles) {
    const filePath = path.join(__dirname, file);
    console.log(`\n---------------------------------------------------------`);
    console.log(`📦 Running seed: ${file}...`);
    try {
      execSync(`node ${filePath}`, { stdio: "inherit" });
      console.log(`✅ Finished: ${file}`);
    } catch (error) {
      console.error(`❌ Error running ${file}:`, error.message);
      // Optional: process.exit(1) if you want to stop on first error
    }
  }

  console.log(`\n---------------------------------------------------------`);
  console.log("🎉 Master seed process completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Master seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
