# Entity Structure (Prisma)

Source of truth: `prisma/schema.prisma`

This document summarizes **domains**, **models**, and **relationships** defined in Prisma.

---

## Global enums (`schema: public`)

- `OrderType`: `DINE_IN`, `TAKEAWAY`, `DELIVERY`
- `OrderStatus`: `NEW`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`, `REFUNDED`
- `PaymentMethod`: `CASH`, `CARD`, `MOMO`, `VNPAY`, `BANK_TRANSFER`
- `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- `StaffRole`: `MANAGER`, `CASHIER`, `KITCHEN`, `OWNER`
- `DeliveryStatus`: `PENDING`, `SHIPPER_ASSIGNED`, `PICKED_UP`, `DELIVERED`, `FAILED`, `CANCELLED`
- `PointType`: `EARN`, `REDEEM`, `EXPIRE`, `ADJUST`
- `DiscountType`: `PERCENT`, `FIXED`
- `CustomerTier`: `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`
- `AuditAction`: `CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`, `LOGIN`, `LOGOUT`, `PERMISSION_CHANGE`
- `VoucherScope`: `PUBLIC`, `CUSTOMER`
- `ProductType`: `SIMPLE`, `COMBO`, `SERVICE`

---

## Domain: AUDIT (`schema: audit`)

### `AuditLog`
- **Purpose**: record-change audit trail for all entities.
- **Key fields**: `entity`, `entityId`, `action`, `oldData`, `newData`, `createdBy`, `createdAt`
- **Indexes**: `@@index([entity, entityId])`

---

## Domain: IAM (`schema: iam`)

### `User`
- **Purpose**: login identity (email/phone) + password hash.
- **Relations**
  - `User` 1—0..1 `Staff`
  - `User` 1—0..1 `Customer`

### `Staff`
- **Purpose**: staff profile per store with a business role.
- **Relations**
  - `Staff` 1—1 `User` (FK `userId`, `onDelete: Cascade`)
  - `Staff` N—1 `Store` (FK `storeId`, `onDelete: Restrict`)

### `Customer`
- **Purpose**: customer profile + cached points balance.
- **Notes**
  - `points` is cached; **source of truth is** `PointTransaction`.
- **Relations**
  - `Customer` 0..1—1 `User` (optional FK `userId`)
  - `Customer` 1—N `Order`
  - `Customer` 1—N `PointTransaction`
  - `Customer` 1—N `CustomerVoucher`

---

## Domain: CATALOG (`schema: catalog`)

### `Category`
- **Purpose**: product grouping for menu.
- **Relations**
  - `Category` 1—N `Product`

### `Product`
- **Purpose**: sellable item with base price/tax.
- **Relations**
  - `Product` N—0..1 `Category` (optional FK `categoryId`)
  - `Product` 1—N `ProductOptionGroup`
  - `Product` 1—N `ProductOptionValue`
  - `Product` 1—N `OrderItem` (sales snapshot at time of sale)

### `OptionGroup`
- **Purpose**: option category like Size/Topping/Sugar Level.
- **Relations**
  - `OptionGroup` 1—N `ProductOption`
  - `OptionGroup` 1—N `ProductOptionGroup` (assign group to product)

### `ProductOption`
- **Purpose**: option value within an `OptionGroup` (e.g., S/M/L).
- **Relations**
  - `ProductOption` N—1 `OptionGroup` (FK `groupId`)
  - `ProductOption` 1—N `ProductOptionValue` (product-specific pricing)

### `ProductOptionGroup` (join)
- **Purpose**: assign an `OptionGroup` to a `Product`.
- **Constraints**
  - `@@unique([productId, optionGroupId])`
- **Relations**
  - `ProductOptionGroup` N—1 `Product`
  - `ProductOptionGroup` N—1 `OptionGroup`

### `ProductOptionValue` (join + pricing)
- **Purpose**: product-specific price for an option.
- **Constraints**
  - `@@unique([productId, optionId])`
- **Relations**
  - `ProductOptionValue` N—1 `Product`
  - `ProductOptionValue` N—1 `ProductOption`

---

## Domain: SALES (`schema: sales`)

### `Store`
- **Purpose**: store/branch info.
- **Relations**
  - `Store` 1—N `Staff`
  - `Store` 1—N `Order`
  - `Store` 1—N `DeliveryOrder`

### `Order`
- **Purpose**: order header and totals.
- **Relations**
  - `Order` N—1 `Store`
  - `Order` N—0..1 `Customer`
  - `Order` 1—N `OrderItem` (cascade delete)
  - `Order` 1—N `Payment` (cascade delete)
  - `Order` 1—0..1 `DeliveryOrder` (cascade delete)
  - `Order` 1—N `VoucherRedemption` (cascade delete)
  - `Order` 1—N `PointTransaction`

### `OrderItem`
- **Purpose**: item lines with snapshot fields (`name`, `sku`, `price`).
- **Relations**
  - `OrderItem` N—1 `Order` (FK `orderId`, `onDelete: Cascade`)
  - `OrderItem` N—1 `Product`
  - `OrderItem` 1—N `OrderItemOption` (cascade delete)

### `OrderItemOption`
- **Purpose**: chosen options for an order item (snapshot name/price).
- **Relations**
  - `OrderItemOption` N—1 `OrderItem` (FK `orderItemId`, `onDelete: Cascade`)

### `Payment`
- **Purpose**: payments per order (supports split payments).
- **Relations**
  - `Payment` N—1 `Order` (FK `orderId`, `onDelete: Cascade`)
  - `Payment` 1—N `Refund` (cascade delete)

### `Refund`
- **Purpose**: refunds tied to a payment.
- **Relations**
  - `Refund` N—1 `Payment` (FK `paymentId`, `onDelete: Cascade`)

---

## Domain: DELIVERY (`schema: delivery`)

### `DeliveryOrder`
- **Purpose**: 1–1 delivery record for an order + receiver snapshot + fees + timeline.
- **Constraints**
  - `orderId` is `@unique` (max 1 delivery per order)
- **Relations**
  - `DeliveryOrder` 1—1 `Order` (FK `orderId`, `onDelete: Cascade`)
  - `DeliveryOrder` N—1 `Store`
  - `DeliveryOrder` 1—N `DeliveryEvent` (cascade delete)

### `DeliveryEvent`
- **Purpose**: timeline events for delivery status.
- **Relations**
  - `DeliveryEvent` N—1 `DeliveryOrder` (FK `deliveryId`, `onDelete: Cascade`)

---

## Domain: LOYALTY (`schema: loyalty`)

### `PointTransaction`
- **Purpose**: immutable ledger for points (earn/redeem/expire/adjust).
- **Notes**
  - `balanceSnap` stores balance after this transaction (audit-friendly).
- **Relations**
  - `PointTransaction` N—1 `Customer`
  - `PointTransaction` N—0..1 `Order`

### `Voucher`
- **Purpose**: discount voucher (public or assigned to customers).
- **Relations**
  - `Voucher` 1—N `VoucherRedemption`
  - `Voucher` 1—N `CustomerVoucher`

### `CustomerVoucher` (assignment)
- **Purpose**: assign a voucher to a specific customer (for `scope = CUSTOMER`).
- **Constraints**
  - `@@unique([customerId, voucherId])`
- **Relations**
  - `CustomerVoucher` N—1 `Customer`
  - `CustomerVoucher` N—1 `Voucher`

### `VoucherRedemption`
- **Purpose**: snapshot discount applied to an order using a voucher.
- **Relations**
  - `VoucherRedemption` N—1 `Order` (FK `orderId`, `onDelete: Cascade`)
  - `VoucherRedemption` N—1 `Voucher`

---

## High-level relationship map (quick view)

- IAM
  - `User` → (`Staff` | `Customer`)
  - `Staff` → `Store`
- Catalog
  - `Category` → `Product`
  - `Product` → `ProductOptionGroup` → `OptionGroup` → `ProductOption` → `ProductOptionValue`
- Sales
  - `Store` → `Order` → `OrderItem` → `OrderItemOption`
  - `Order` → `Payment` → `Refund`
- Delivery
  - `Order` → `DeliveryOrder` → `DeliveryEvent`
- Loyalty
  - `Customer` → `PointTransaction` → (optional) `Order`
  - `Voucher` → (`CustomerVoucher` | `VoucherRedemption`)

