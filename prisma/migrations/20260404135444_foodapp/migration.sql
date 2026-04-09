/*
  Warnings:

  - The `type` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `DeliveryOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tier` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `scope` column on the `Voucher` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `Staff` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `PointTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `discountType` on the `Voucher` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CARD', 'MOMO', 'VNPAY', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."StaffRole" AS ENUM ('MANAGER', 'CASHIER', 'KITCHEN', 'OWNER');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'SHIPPER_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PointType" AS ENUM ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."CustomerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE');

-- CreateEnum
CREATE TYPE "public"."VoucherScope" AS ENUM ('PUBLIC', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('SIMPLE', 'COMBO', 'SERVICE');

-- AlterTable
ALTER TABLE "audit"."AuditLog" DROP COLUMN "action",
ADD COLUMN     "action" "public"."AuditAction" NOT NULL;

-- AlterTable
ALTER TABLE "catalog"."Product" DROP COLUMN "type",
ADD COLUMN     "type" "public"."ProductType" NOT NULL DEFAULT 'SIMPLE';

-- AlterTable
ALTER TABLE "delivery"."DeliveryOrder" DROP COLUMN "status",
ADD COLUMN     "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "iam"."Customer" DROP COLUMN "tier",
ADD COLUMN     "tier" "public"."CustomerTier" NOT NULL DEFAULT 'BRONZE';

-- AlterTable
ALTER TABLE "iam"."Staff" DROP COLUMN "role",
ADD COLUMN     "role" "public"."StaffRole" NOT NULL;

-- AlterTable
ALTER TABLE "loyalty"."PointTransaction" DROP COLUMN "type",
ADD COLUMN     "type" "public"."PointType" NOT NULL;

-- AlterTable
ALTER TABLE "loyalty"."Voucher" DROP COLUMN "scope",
ADD COLUMN     "scope" "public"."VoucherScope" NOT NULL DEFAULT 'PUBLIC',
DROP COLUMN "discountType",
ADD COLUMN     "discountType" "public"."DiscountType" NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Order" DROP COLUMN "type",
ADD COLUMN     "type" "public"."OrderType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "sales"."Payment" DROP COLUMN "method",
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';
