-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "delivery";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "iam";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "loyalty";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sales";

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

-- CreateTable
CREATE TABLE "audit"."AuditLog" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."RefreshToken" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" VARCHAR(45),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "replacedBy" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "tier" "CustomerTier" NOT NULL DEFAULT 'BRONZE',
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProductType" NOT NULL DEFAULT 'SIMPLE',
    "basePrice" DECIMAL(14,2) NOT NULL,
    "costPrice" DECIMAL(14,2),
    "taxRate" DECIMAL(5,2) NOT NULL,
    "thumbnail" TEXT,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."OptionGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isMultiple" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."ProductOption" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."ProductOptionGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "optionGroupId" TEXT NOT NULL,
    "sortOrder" INTEGER,

    CONSTRAINT "ProductOptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."ProductOptionValue" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Store" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "hotline" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Order" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "serviceFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "createdByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(14,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "note" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."OrderItemOption" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "OrderItemOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(14,2) NOT NULL,
    "providerRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery"."DeliveryOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "estimatedFee" DECIMAL(14,2),
    "actualFee" DECIMAL(14,2),
    "shipperName" TEXT,
    "shipperPhone" TEXT,
    "trackingCode" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery"."DeliveryEvent" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty"."PointTransaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "PointType" NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceSnap" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty"."Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scope" "VoucherScope" NOT NULL DEFAULT 'PUBLIC',
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(14,2) NOT NULL,
    "maxUsage" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minOrderAmount" DECIMAL(14,2),
    "maxDiscount" DECIMAL(14,2),
    "storeId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty"."CustomerVoucher" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty"."VoucherRedemption" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "VoucherRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "audit"."AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "iam"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "iam"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "iam"."RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "iam"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "iam"."RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "iam"."Staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "iam"."Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "iam"."Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "catalog"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "catalog"."Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionGroup_productId_optionGroupId_key" ON "catalog"."ProductOptionGroup"("productId", "optionGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionValue_productId_optionId_key" ON "catalog"."ProductOptionValue"("productId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_code_key" ON "sales"."Store"("code");

-- CreateIndex
CREATE INDEX "Order_storeId_createdAt_idx" ON "sales"."Order"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_customerId_createdAt_idx" ON "sales"."Order"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "sales"."Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOrder_orderId_key" ON "delivery"."DeliveryOrder"("orderId");

-- CreateIndex
CREATE INDEX "DeliveryOrder_storeId_requestedAt_idx" ON "delivery"."DeliveryOrder"("storeId", "requestedAt");

-- CreateIndex
CREATE INDEX "PointTransaction_customerId_createdAt_idx" ON "loyalty"."PointTransaction"("customerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "loyalty"."Voucher"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerVoucher_customerId_voucherId_key" ON "loyalty"."CustomerVoucher"("customerId", "voucherId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_voucherId_idx" ON "loyalty"."VoucherRedemption"("voucherId");

-- AddForeignKey
ALTER TABLE "iam"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "iam"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "iam"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."Staff" ADD CONSTRAINT "Staff_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "iam"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "catalog"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."ProductOption" ADD CONSTRAINT "ProductOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "catalog"."OptionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."ProductOptionGroup" ADD CONSTRAINT "ProductOptionGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."ProductOptionGroup" ADD CONSTRAINT "ProductOptionGroup_optionGroupId_fkey" FOREIGN KEY ("optionGroupId") REFERENCES "catalog"."OptionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "catalog"."ProductOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "iam"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderItemOption" ADD CONSTRAINT "OrderItemOption_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "sales"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "sales"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "sales"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery"."DeliveryEvent" ADD CONSTRAINT "DeliveryEvent_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "delivery"."DeliveryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."PointTransaction" ADD CONSTRAINT "PointTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "iam"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."PointTransaction" ADD CONSTRAINT "PointTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."CustomerVoucher" ADD CONSTRAINT "CustomerVoucher_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "iam"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."CustomerVoucher" ADD CONSTRAINT "CustomerVoucher_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "loyalty"."Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty"."VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "loyalty"."Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
