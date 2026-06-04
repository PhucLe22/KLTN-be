/*
  Warnings:

  - You are about to drop the column `createdByStaffId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderCode` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StaffRole" ADD VALUE 'ROOT';
ALTER TYPE "StaffRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "catalog"."Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."Product" ADD COLUMN     "preparationTime" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Order" DROP COLUMN "createdByStaffId",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "orderCode" TEXT NOT NULL,
ADD COLUMN     "tableNumber" TEXT;

-- AlterTable
ALTER TABLE "sales"."Store" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "delivery"."DeliveryRoute" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "orderSequence" TEXT[],
    "estimatedArrivalTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "catalog"."Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "sales"."Order"("orderCode");

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "iam"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."Voucher" ADD CONSTRAINT "Voucher_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
