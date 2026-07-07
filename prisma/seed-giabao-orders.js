import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { OrderStatus, OrderType, DeliveryStatus } from "../constants/enum.js";

const CUSTOMER_ID = "47ae7934-b30e-4062-afc5-e3943b6875e1";
const USER_ID = "808c6024-4d0d-4f7a-b53e-6e7fbfccf080";
const STORE_ID = "824e749b-14c9-428f-b40d-d633ddbeae33";

const PRODUCTS = {
  CF001: { id: "623ebb4d-a412-4edd-a703-3477c04b0e7a", name: "Espresso", price: 25000, sku: "CF001" },
  CF002: { id: "f01863a9-fcd7-4a37-8205-702a66013867", name: "Americano", price: 30000, sku: "CF002" },
  CF004: { id: "7b6f42d5-0542-47b3-b30b-8c10f22ca4ad", name: "Latte", price: 40000, sku: "CF004" },
  CF005: { id: "45aea2bf-2135-4a0b-bbf5-0cd6436da7db", name: "Mocha", price: 48000, sku: "CF005" },
  MT005: { id: "17904411-d7bd-4857-b97a-f7c18fa91d99", name: "Trà Sữa Thái Xanh", price: 38000, sku: "MT005" },
  MT006: { id: "38699643-8cc3-48e3-85f1-c569cc66cedc", name: "Trà Sữa Caramel", price: 40000, sku: "MT006" },
  MT008: { id: "174a665e-12ad-43fc-8aed-2d124fa90289", name: "Trà Sữa Hạnh Nhân", price: 42000, sku: "MT008" },
  MT009: { id: "48904d54-3c64-4b61-ae4b-af9ea1d148bb", name: "Trà Sữa Oolong", price: 40000, sku: "MT009" },
  MT011: { id: "4af038ed-9a61-4b02-9822-62bdf9dcd013", name: "Trà Sữa Chocolate Đen", price: 42000, sku: "MT011" },
  MT012: { id: "2764cae1-0244-4919-b930-1cf407a9d6c3", name: "Trà Sữa Dừa Non", price: 40000, sku: "MT012" },
  MT016: { id: "5680d8c7-5cf3-4687-88b1-5ad97b2d9fe1", name: "Socola Đá Xay", price: 48000, sku: "MT016" },
  DR003: { id: "11624c6f-c2c1-4425-979e-d9fa23bcf6ff", name: "Nước Ép Cam", price: 30000, sku: "DR003" },
  DR008: { id: "2e4831a8-a019-45dd-9759-bedff4fbf9d1", name: "Sinh Tố Xoài", price: 40000, sku: "DR008" },
  DR009: { id: "62070e54-2d82-4d6e-9948-da865c5b3ae8", name: "Nước Ép Dưa Hấu", price: 28000, sku: "DR009" },
};

const ADDRESSES = [
  { address: "1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh", lat: 10.8528, lng: 106.7726 },
  { address: "123 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh", lat: 10.7725, lng: 106.7046 },
  { address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh", lat: 10.7711, lng: 106.6664 },
  { address: "90 Nguyễn Văn Linh, Tân Phong, Quận 7, TP. Hồ Chí Minh", lat: 10.7357, lng: 106.7058 },
  { address: "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh", lat: 10.7950, lng: 106.7219 },
  { address: "1 Công Xã Paris, Bến Nghé, Quận 1, TP. Hồ Chí Minh", lat: 10.7797, lng: 106.6990 },
  { address: "28 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh", lat: 10.7795, lng: 106.6921 },
  { address: "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP. Hồ Chí Minh", lat: 10.7936, lng: 106.7203 },
  { address: "135 Nam Kỳ Khởi Nghĩa, Bến Nghé, Quận 1, TP. Hồ Chí Minh", lat: 10.7770, lng: 106.6953 },
  { address: "97A Phó Đức Chính, Phường 12, Quận 1, TP. Hồ Chí Minh", lat: 10.7698, lng: 106.6994 },
  { address: "3 Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1, TP. Hồ Chí Minh", lat: 10.7875, lng: 106.7052 },
  { address: "281 Hai Bà Trưng, Phường 8, Quận 3, TP. Hồ Chí Minh", lat: 10.7884, lng: 106.6908 },
  { address: "Hoàng Minh Giám, Phường 9, Phú Nhuận, TP. Hồ Chí Minh", lat: 10.8116, lng: 106.6778 },
  { address: "2 Nguyễn Văn Thủ, Đa Kao, Quận 1, TP. Hồ Chí Minh", lat: 10.7904, lng: 106.7052 },
  { address: "157 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh", lat: 10.7762, lng: 106.6875 },
  { address: "55 Nguyễn Văn Trỗi, Phường 7, Phú Nhuận, TP. Hồ Chí Minh", lat: 10.7973, lng: 106.6752 },
  { address: "12 Tôn Đản, Phường 13, Quận 4, TP. Hồ Chí Minh", lat: 10.7602, lng: 106.7038 },
  { address: "345 Cách Mạng Tháng 8, Phường 10, Quận 3, TP. Hồ Chí Minh", lat: 10.7787, lng: 106.6736 },
];

const RECEIVERS = [
  { name: "Gia Bảo", phone: "0917630445" },
  { name: "Nguyễn Thiên Phúc", phone: "0933710446" },
  { name: "Trần Phúc Nguyên", phone: "0933710447" },
  { name: "Lê Thị Ánh Thư", phone: "0909123456" },
  { name: "Phạm Minh Hoàng", phone: "0918234567" },
  { name: "Nguyễn Thị Lan", phone: "0988345678" },
];

const PRODUCT_KEYS = Object.keys(PRODUCTS);

function randomItems(count) {
  const items = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let pk;
    do { pk = PRODUCT_KEYS[Math.floor(Math.random() * PRODUCT_KEYS.length)]; } while (used.has(pk));
    used.add(pk);
    const qty = Math.floor(Math.random() * 3) + 1;
    items.push({ p: pk, qty });
  }
  return items;
}

const ORDER_DEFS = [
  { addrIdx: 0, recvIdx: 0, items: [{ p: "MT012", qty: 2 }, { p: "MT005", qty: 1 }] },
  { addrIdx: 1, recvIdx: 1, items: [{ p: "CF001", qty: 1 }, { p: "CF004", qty: 1 }] },
  { addrIdx: 2, recvIdx: 2, items: [{ p: "MT006", qty: 2 }] },
  { addrIdx: 3, recvIdx: 3, items: [{ p: "MT008", qty: 1 }, { p: "MT009", qty: 1 }, { p: "DR003", qty: 1 }] },
  { addrIdx: 4, recvIdx: 4, items: [{ p: "CF005", qty: 2 }] },
  { addrIdx: 5, recvIdx: 5, items: [{ p: "MT011", qty: 1 }, { p: "DR008", qty: 1 }] },
  { addrIdx: 6, recvIdx: 0, items: [{ p: "MT016", qty: 1 }] },
  { addrIdx: 7, recvIdx: 1, items: [{ p: "CF002", qty: 3 }] },
  { addrIdx: 8, recvIdx: 2, items: [{ p: "MT005", qty: 1 }, { p: "MT012", qty: 2 }] },
  { addrIdx: 9, recvIdx: 3, items: [{ p: "DR009", qty: 2 }, { p: "DR003", qty: 1 }] },
  { addrIdx: 10, recvIdx: 4, items: [{ p: "MT009", qty: 1 }, { p: "MT008", qty: 1 }] },
  { addrIdx: 11, recvIdx: 5, items: [{ p: "CF004", qty: 2 }, { p: "CF001", qty: 1 }] },
  { addrIdx: 12, recvIdx: 0, items: [{ p: "MT006", qty: 1 }, { p: "DR008", qty: 1 }] },
  { addrIdx: 13, recvIdx: 1, items: [{ p: "MT011", qty: 2 }] },
  { addrIdx: 14, recvIdx: 2, items: [{ p: "CF005", qty: 1 }, { p: "MT016", qty: 1 }] },
  { addrIdx: 15, recvIdx: 3, items: [{ p: "MT005", qty: 2 }, { p: "MT006", qty: 1 }] },
  { addrIdx: 16, recvIdx: 4, items: [{ p: "CF002", qty: 1 }, { p: "DR009", qty: 2 }] },
  { addrIdx: 17, recvIdx: 5, items: [{ p: "MT012", qty: 3 }] },
];

function calcSubtotal(items) {
  return Number(items.reduce((sum, item) => sum + PRODUCTS[item.p].price * item.qty, 0).toFixed(2));
}

async function main() {
  console.log("Cleaning up existing delivery orders for Gia Bảo...");
  const existingOrders = await prisma.deliveryOrder.findMany({
    where: { order: { customerId: CUSTOMER_ID } },
    select: { id: true, orderId: true }
  });
  if (existingOrders.length > 0) {
    const orderIds = existingOrders.map(o => o.orderId);
    await prisma.deliveryEvent.deleteMany({ where: { deliveryId: { in: existingOrders.map(o => o.id) } } });
    await prisma.deliveryRoute.deleteMany({ where: { deliveryOrderId: { in: existingOrders.map(o => o.id) } } });
    await prisma.deliveryOrder.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    console.log(`Deleted ${existingOrders.length} existing orders.\n`);
  } else {
    console.log("No existing orders found.\n");
  }

  console.log("Seeding addresses and delivery orders for Gia Bảo...\n");

  for (let i = 0; i < ADDRESSES.length; i++) {
    const addr = ADDRESSES[i];
    const existing = await prisma.address.findFirst({
      where: { customerId: CUSTOMER_ID, addressLine: addr.address }
    });
    if (!existing) {
      await prisma.address.create({
        data: {
          customerId: CUSTOMER_ID,
          receiverName: "Gia Bảo",
          receiverPhone: "0917630445",
          addressLine: addr.address,
          lat: addr.lat,
          lng: addr.lng,
          isDefault: i === 0,
          label: i === 0 ? "Nhà riêng" : `Địa chỉ ${i + 1}`,
        }
      });
      console.log(`  Address ${i + 1}: ${addr.address}`);
    } else {
      console.log(`  Address ${i + 1}: already exists, skipped.`);
    }
  }

  console.log("\nCreating orders...\n");

  const baseTs = Date.now() - 240 * 60 * 1000;
  let orderNum = 0;

  for (const def of ORDER_DEFS) {
    orderNum++;
    const addr = ADDRESSES[def.addrIdx];
    const receiver = RECEIVERS[def.recvIdx];
    const subtotal = calcSubtotal(def.items);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const serviceFee = 15000;
    const total = Number((subtotal + tax + serviceFee).toFixed(2));
    const orderCode = `VD-DE-${baseTs + orderNum}`;
    const createdAt = new Date(baseTs + orderNum * 12 * 60 * 1000);

    console.log(`Order ${orderNum}: ${orderCode} | NEW | ${receiver.name} -> ${addr.address}`);

    const prismaItems = def.items.map((item) => {
      const product = PRODUCTS[item.p];
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.qty,
        tax: 0,
        discount: 0,
      };
    });

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderCode,
          storeId: STORE_ID,
          customerId: CUSTOMER_ID,
          type: OrderType.DELIVERY,
          status: OrderStatus.NEW,
          subtotal,
          discount: 0,
          tax,
          serviceFee,
          total,
          createdBy: USER_ID,
          createdAt,
          items: { create: prismaItems },
          delivery: {
            create: {
              storeId: STORE_ID,
              receiverName: receiver.name,
              receiverPhone: receiver.phone,
              addressLine: addr.address,
              lat: addr.lat,
              lng: addr.lng,
              status: DeliveryStatus.PENDING,
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

  }

  console.log(`\nDone! Created ${ORDER_DEFS.length} orders for Gia Bảo.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
