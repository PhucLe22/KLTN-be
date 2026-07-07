import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { OrderStatus, OrderType } from "../constants/enum.js";

// ============================================================
// CUSTOMER
// ============================================================
const CUSTOMER_ID = "2ae0ebfc-76d5-4e64-956d-607b1f9fc636";
const USER_ID = "1ad1fc6e-9a48-4412-95f5-0197b308b46c";

// ============================================================
// PRODUCTS (CF001-CF005)
// ============================================================
const PRODUCTS = {
  CF001: { id: "13ec9b1c-db10-44b2-bfd1-8bdd6c77a0c1", name: "Espresso",     price: 25000, sku: "CF001" },
  CF002: { id: "d8dc3393-b7ac-4bb6-9f96-d32562ecd0be", name: "Americano",    price: 30000, sku: "CF002" },
  CF003: { id: "da232dbb-3997-4b1b-8e29-0d2dc7cfb3e8", name: "Cappuccino",   price: 45000, sku: "CF003" },
  CF004: { id: "348e7715-c6f5-4067-90b3-f95e984f5d4b", name: "Latte",        price: 40000, sku: "CF004" },
  CF005: { id: "3881e73f-3a09-44b3-bd18-2e029e142a0a", name: "Mocha",        price: 48000, sku: "CF005" },
};

// ============================================================
// OPTIONS (Size + Sugar Level + Ice Level)
// ============================================================
const OPT = {
  SIZE_S:      { id: "550e8400-e29b-41d4-a716-446655440101", name: "S",                price: 0 },
  SIZE_M:      { id: "550e8400-e29b-41d4-a716-446655440102", name: "M",                price: 5000 },
  SIZE_L:      { id: "550e8400-e29b-41d4-a716-446655440103", name: "L",                price: 10000 },
  SUGAR_0:     { id: "550e8400-e29b-41d4-a716-446655440201", name: "0% (Không Đường)", price: 0 },
  SUGAR_30:    { id: "550e8400-e29b-41d4-a716-446655440202", name: "30% (Ít Ngọt)",    price: 0 },
  SUGAR_50:    { id: "550e8400-e29b-41d4-a716-446655440203", name: "50% (Nửa Ngọt)",   price: 0 },
  SUGAR_70:    { id: "550e8400-e29b-41d4-a716-446655440204", name: "70% (Ngọt)",       price: 0 },
  SUGAR_100:   { id: "550e8400-e29b-41d4-a716-446655440205", name: "100% (Rất Ngọt)",  price: 0 },
  ICE_NONE:    { id: "550e8400-e29b-41d4-a716-446655440301", name: "Không Đá",         price: 0 },
  ICE_LESS:    { id: "550e8400-e29b-41d4-a716-446655440302", name: "Ít Đá",            price: 0 },
  ICE_REGULAR: { id: "550e8400-e29b-41d4-a716-446655440303", name: "Đá Thường",        price: 0 },
};

// ============================================================
// DELIVERY ADDRESSES (3 customer saved + 15 HCMC landmarks)
// ============================================================
const ADDRESSES = [
  { address: "1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh",                  lat: 10.8527907, lng: 106.7725584 },
  { address: "1 Bùi Thị Xuân, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",            lat: null,       lng: null },
  { address: "42 Xô Viết Nghệ Tĩnh, Phường 19, Bình Thạnh, TP. Hồ Chí Minh",          lat: 10.0383338, lng: 105.7839942 },
  { address: "Tháp Bitexco, 2 Hai Triều, Quận 1, TP. Hồ Chí Minh",                   lat: 10.7715,    lng: 106.7042 },
  { address: "Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh",          lat: 10.7950,    lng: 106.7219 },
  { address: "Nhà Thờ Đức Bà, 1 Công Xã Paris, Quận 1, TP. Hồ Chí Minh",             lat: 10.7797,    lng: 106.6990 },
  { address: "Chợ Bến Thành, Lê Lợi, Quận 1, TP. Hồ Chí Minh",                       lat: 10.7725,    lng: 106.6980 },
  { address: "Bảo Tàng Chứng Tích Chiến Tranh, 28 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh", lat: 10.7795, lng: 106.6921 },
  { address: "Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh", lat: 10.7936,  lng: 106.7203 },
  { address: "Bến Nhà Rồng, 1 Nguyễn Tất Thành, Quận 4, TP. Hồ Chí Minh",             lat: 10.7681,    lng: 106.7068 },
  { address: "Công Viên Tao Đàn, Trương Định, Quận 1, TP. Hồ Chí Minh",               lat: 10.7745,    lng: 106.6922 },
  { address: "Thảo Cầm Viên, 2 Nguyễn Bỉnh Khiêm, Quận 1, TP. Hồ Chí Minh",           lat: 10.7875,    lng: 106.7052 },
  { address: "Nhà Thờ Tân Định, 281 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh",           lat: 10.7884,    lng: 106.6908 },
  { address: "Dinh Độc Lập, 135 Nam Kỳ Khởi Nghĩa, Quận 1, TP. Hồ Chí Minh",          lat: 10.7770,    lng: 106.6953 },
  { address: "Nhà Hát Lớn, 7 Công Trường Lam Sơn, Quận 1, TP. Hồ Chí Minh",           lat: 10.7766,    lng: 106.7032 },
  { address: "Hồ Con Rùa, Công Trường Quốc Tế, Quận 3, TP. Hồ Chí Minh",              lat: 10.7827,    lng: 106.6960 },
  { address: "Công Viên Gia Định, Hoàng Minh Giám, Phú Nhuận, TP. Hồ Chí Minh",        lat: 10.8116,    lng: 106.6778 },
  { address: "Bảo Tàng Mỹ Thuật, 97A Phó Đức Chính, Quận 1, TP. Hồ Chí Minh",         lat: 10.7698,    lng: 106.6994 },
];

// ============================================================
// RECEIVERS (vary names/phones for realism)
// ============================================================
const RECEIVERS = [
  { name: "Nguyễn Thiên Phúc", phone: "09337104446" },
  { name: "Trần Phúc Nguyên",  phone: "09337104446" },
  { name: "Lê Thị Ánh Thư",    phone: "0909123456"  },
  { name: "Phạm Minh Hoàng",   phone: "0918234567"  },
  { name: "Nguyễn Thị Lan",    phone: "0988345678"  },
  { name: "Trần Văn Thành",    phone: "0978456789"  },
];

// ============================================================
// ORDER DEFINITIONS (18 orders)
// ============================================================
const orderDefinitions = [
  // 1: 1 Võ Văn Ngân - 2 Espresso S, 30% sugar, Less ice
  { addrIdx: 0, recvIdx: 0, items: [
    { p: "CF001", qty: 2, opts: ["SIZE_S", "SUGAR_30", "ICE_LESS"] },
  ]},
  // 2: 1 Bùi Thị Xuân - 1 Americano M, 50% sugar, Regular ice
  { addrIdx: 1, recvIdx: 1, items: [
    { p: "CF002", qty: 1, opts: ["SIZE_M", "SUGAR_50", "ICE_REGULAR"] },
  ]},
  // 3: 42 Xô Viết Nghệ Tĩnh - 1 Cappuccino L, 70% sugar, No ice
  { addrIdx: 2, recvIdx: 2, items: [
    { p: "CF003", qty: 1, opts: ["SIZE_L", "SUGAR_70", "ICE_NONE"] },
  ]},
  // 4: Bitexco - 1 Latte M, 30% sugar, Less ice
  { addrIdx: 3, recvIdx: 3, items: [
    { p: "CF004", qty: 1, opts: ["SIZE_M", "SUGAR_30", "ICE_LESS"] },
  ]},
  // 5: Landmark 81 - 1 Mocha L, 50% sugar, Regular ice
  { addrIdx: 4, recvIdx: 4, items: [
    { p: "CF005", qty: 1, opts: ["SIZE_L", "SUGAR_50", "ICE_REGULAR"] },
  ]},
  // 6: Notre Dame - 1 Espresso S 0% No ice + 1 Americano M 30% Less ice
  { addrIdx: 5, recvIdx: 5, items: [
    { p: "CF001", qty: 1, opts: ["SIZE_S", "SUGAR_0", "ICE_NONE"] },
    { p: "CF002", qty: 1, opts: ["SIZE_M", "SUGAR_30", "ICE_LESS"] },
  ]},
  // 7: Ben Thanh - 2 Cappuccino M, 50% sugar, Regular ice
  { addrIdx: 6, recvIdx: 0, items: [
    { p: "CF003", qty: 2, opts: ["SIZE_M", "SUGAR_50", "ICE_REGULAR"] },
  ]},
  // 8: War Remnants - 1 Latte S, 70% sugar, Less ice
  { addrIdx: 7, recvIdx: 1, items: [
    { p: "CF004", qty: 1, opts: ["SIZE_S", "SUGAR_70", "ICE_LESS"] },
  ]},
  // 9: Vinhomes - 1 Mocha S 30% No ice + 1 Espresso L 50% Regular ice
  { addrIdx: 8, recvIdx: 2, items: [
    { p: "CF005", qty: 1, opts: ["SIZE_S", "SUGAR_30", "ICE_NONE"] },
    { p: "CF001", qty: 1, opts: ["SIZE_L", "SUGAR_50", "ICE_REGULAR"] },
  ]},
  // 10: Dragon Wharf - 2 Americano L, 70% sugar, No ice
  { addrIdx: 9, recvIdx: 3, items: [
    { p: "CF002", qty: 2, opts: ["SIZE_L", "SUGAR_70", "ICE_NONE"] },
  ]},
  // 11: Tao Dan Park - 1 Cappuccino S, 100% sugar, Regular ice
  { addrIdx: 10, recvIdx: 4, items: [
    { p: "CF003", qty: 1, opts: ["SIZE_S", "SUGAR_100", "ICE_REGULAR"] },
  ]},
  // 12: Saigon Zoo - 1 Latte M 50% Less ice + 1 Mocha M 50% Less ice
  { addrIdx: 11, recvIdx: 5, items: [
    { p: "CF004", qty: 1, opts: ["SIZE_M", "SUGAR_50", "ICE_LESS"] },
    { p: "CF005", qty: 1, opts: ["SIZE_M", "SUGAR_50", "ICE_LESS"] },
  ]},
  // 13: Tan Dinh Church - 3 Espresso M, 30% sugar, Regular ice
  { addrIdx: 12, recvIdx: 0, items: [
    { p: "CF001", qty: 3, opts: ["SIZE_M", "SUGAR_30", "ICE_REGULAR"] },
  ]},
  // 14: Independence Palace - 1 Americano S, 0% sugar, No ice
  { addrIdx: 13, recvIdx: 1, items: [
    { p: "CF002", qty: 1, opts: ["SIZE_S", "SUGAR_0", "ICE_NONE"] },
  ]},
  // 15: Opera House - 1 Cappuccino L 70% No ice + 1 Latte L 30% Less ice
  { addrIdx: 14, recvIdx: 3, items: [
    { p: "CF003", qty: 1, opts: ["SIZE_L", "SUGAR_70", "ICE_NONE"] },
    { p: "CF004", qty: 1, opts: ["SIZE_L", "SUGAR_30", "ICE_LESS"] },
  ]},
  // 16: Turtle Lake - 1 Mocha S, 100% sugar, Regular ice
  { addrIdx: 15, recvIdx: 4, items: [
    { p: "CF005", qty: 1, opts: ["SIZE_S", "SUGAR_100", "ICE_REGULAR"] },
  ]},
  // 17: Gia Dinh Park - 1 Espresso M 50% Less ice + 2 Americano M 70% Less ice
  { addrIdx: 16, recvIdx: 5, items: [
    { p: "CF001", qty: 1, opts: ["SIZE_M", "SUGAR_50", "ICE_LESS"] },
    { p: "CF002", qty: 2, opts: ["SIZE_M", "SUGAR_70", "ICE_LESS"] },
  ]},
  // 18: Fine Arts Museum - 2 Mocha L, 30% sugar, Regular ice
  { addrIdx: 17, recvIdx: 0, items: [
    { p: "CF005", qty: 2, opts: ["SIZE_L", "SUGAR_30", "ICE_REGULAR"] },
  ]},
];

// ============================================================
// HELPERS
// ============================================================

function resolveOptions(optKeys) {
  return optKeys.map((k) => ({ name: OPT[k].name, price: OPT[k].price }));
}

function calcSubtotal(items) {
  return Number(items.reduce((sum, item) => {
    const optsPrice = item.opts.reduce((s, k) => s + OPT[k].price, 0);
    return sum + (PRODUCTS[item.p].price + optsPrice) * item.qty;
  }, 0).toFixed(2));
}

function buildPrismaItems(items) {
  return items.map((item) => {
    const product = PRODUCTS[item.p];
    const options = resolveOptions(item.opts);
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.qty,
      tax: 0,
      discount: 0,
      options: { create: options.map((o) => ({ name: o.name, price: o.price })) },
    };
  });
}

// ============================================================
// MAIN SEED
// ============================================================

async function seedDeliveryOrders() {
  console.log("🚀 Seeding 18 delivery orders for Thien Phuc...\n");

  const baseTs = Date.now() - 180 * 60 * 1000; // 3 hours ago
  let orderNum = 0;

  for (const def of orderDefinitions) {
    orderNum++;
    const address = ADDRESSES[def.addrIdx];
    const receiver = RECEIVERS[def.recvIdx];
    const subtotal = calcSubtotal(def.items);
    const saleTax = Number((subtotal * 0.08).toFixed(2));
    const serviceFee = 15000;
    const total = Number((subtotal + saleTax + serviceFee).toFixed(2));
    const orderCode = `VD-DE-${baseTs + orderNum}`;
    const createdAt = new Date(baseTs + orderNum * 10 * 60 * 1000);
    const prismaItems = buildPrismaItems(def.items);

    console.log(`\n--- Order ${orderNum}: ${orderCode} ---`);
    console.log(`  -> To: ${address.address}`);
    console.log(`  -> Receiver: ${receiver.name} ${receiver.phone}`);
    console.log(`  -> Items: ${def.items.map(i => `${PRODUCTS[i.p].name} x${i.qty} [${i.opts.join(", ")}]`).join(" | ")}`);
    console.log(`  -> Subtotal: ${subtotal} | Tax: ${saleTax} | Fee: ${serviceFee} | Total: ${total}`);

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderCode,
          storeId: null,
          customerId: CUSTOMER_ID,
          type: OrderType.DELIVERY,
          status: OrderStatus.NEW,
          subtotal,
          discount: 0,
          tax: saleTax,
          serviceFee,
          total,
          createdBy: USER_ID,
          createdAt,
          items: { create: prismaItems },
          delivery: {
            create: {
              storeId: null,
              receiverName: receiver.name,
              receiverPhone: receiver.phone,
              addressLine: address.address,
              lat: address.lat ?? undefined,
              lng: address.lng ?? undefined,
            },
          },
        },
        include: { delivery: true },
      });

      await tx.deliveryEvent.create({
        data: {
          deliveryId: order.delivery.id,
          status: OrderStatus.NEW,
          note: "Đơn hàng đã được đặt thành công",
        },
      });
    });

    console.log(`  ✅ Created successfully`);
  }

  console.log(`\n🎉 Successfully seeded ${orderDefinitions.length} delivery orders!`);
}

seedDeliveryOrders()
  .catch((e) => {
    console.error("❌ Error seeding delivery orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
