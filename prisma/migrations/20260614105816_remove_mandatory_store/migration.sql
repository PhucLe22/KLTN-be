/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DeliveryRoute` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedArrivalTime` on the `DeliveryRoute` table. All the data in the column will be lost.
  - You are about to drop the column `orderSequence` on the `DeliveryRoute` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `DeliveryRoute` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shipperId]` on the table `DeliveryRoute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deliveryOrderId]` on the table `DeliveryRoute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `route` to the `DeliveryRoute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipperId` to the `DeliveryRoute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERING';

-- AlterEnum
ALTER TYPE "StaffRole" ADD VALUE 'SHIPPER';

-- DropForeignKey
ALTER TABLE "delivery"."DeliveryOrder" DROP CONSTRAINT "DeliveryOrder_storeId_fkey";

-- DropForeignKey
ALTER TABLE "delivery"."DeliveryRoute" DROP CONSTRAINT "DeliveryRoute_staffId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_storeId_fkey";

-- AlterTable
ALTER TABLE "delivery"."DeliveryOrder" ADD COLUMN     "deliverySequence" INTEGER,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "shipperId" TEXT,
ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "delivery"."DeliveryRoute" DROP COLUMN "createdAt",
DROP COLUMN "estimatedArrivalTime",
DROP COLUMN "orderSequence",
DROP COLUMN "staffId",
ADD COLUMN     "deliveryOrderId" TEXT,
ADD COLUMN     "route" JSONB NOT NULL,
ADD COLUMN     "shipperId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "iam"."User" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "sales"."Order" ADD COLUMN     "chefId" TEXT,
ADD COLUMN     "expectedReadyAt" TIMESTAMP(3),
ALTER COLUMN "storeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "storeId" TEXT,
    "receiverName" TEXT,
    "receiverPhone" TEXT,
    "addressLine" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE INDEX "Address_storeId_idx" ON "Address"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRoute_shipperId_key" ON "delivery"."DeliveryRoute"("shipperId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRoute_deliveryOrderId_key" ON "delivery"."DeliveryRoute"("deliveryOrderId");

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "iam"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "iam"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "iam"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_deliveryOrderId_fkey" FOREIGN KEY ("deliveryOrderId") REFERENCES "delivery"."DeliveryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "iam"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
