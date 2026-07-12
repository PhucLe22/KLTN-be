import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { OrderStatus, OrderType } from "../constants/enum.js";

const locations = [
  { name: "Tháp Bitexco", lat: 10.7715, lng: 106.7042, address: "2 Hai Triều, Quận 1, TP. Hồ Chí Minh" },
  { name: "Landmark 81", lat: 10.7950, lng: 106.7219, address: "720A Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh" },
  { name: "Nhà Thờ Đức Bà", lat: 10.7797, lng: 106.6990, address: "1 Công Xã Paris, Quận 1, TP. Hồ Chí Minh" },
  { name: "Chợ Bến Thành", lat: 10.7725, lng: 106.6980, address: "Lê Lợi, Quận 1, TP. Hồ Chí Minh" },
  { name: "Bảo Tàng Chứng Tích Chiến Tranh", lat: 10.7795, lng: 106.6921, address: "28 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh" },
  { name: "Vinhomes Central Park", lat: 10.7936, lng: 106.7203, address: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh" },
  { name: "Bến Nhà Rồng", lat: 10.7681, lng: 106.7068, address: "1 Nguyễn Tất Thành, Quận 4, TP. Hồ Chí Minh" },
  { name: "Công Viên Tao Đàn", lat: 10.7745, lng: 106.6922, address: "Trương Định, Quận 1, TP. Hồ Chí Minh" },
  { name: "Thảo Cầm Viên Sài Gòn", lat: 10.7875, lng: 106.7052, address: "2 Nguyễn Bỉnh Khiêm, Quận 1, TP. Hồ Chí Minh" },
  { name: "Nhà Thờ Tân Định", lat: 10.7884, lng: 106.6908, address: "281 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh" },
  { name: "Dinh Độc Lập", lat: 10.7770, lng: 106.6953, address: "135 Nam Kỳ Khởi Nghĩa, Quận 1, TP. Hồ Chí Minh" },
  { name: "Nhà Hát Lớn", lat: 10.7766, lng: 106.7032, address: "7 Công Trường Lam Sơn, Quận 1, TP. Hồ Chí Minh" },
  { name: "Hồ Con Rùa", lat: 10.7827, lng: 106.6960, address: "Công Trường Quốc Tế, Quận 3, TP. Hồ Chí Minh" },
  { name: "Công Viên Gia Định", lat: 10.8116, lng: 106.6778, address: "Hoàng Minh Giám, Phú Nhuận, TP. Hồ Chí Minh" },
  { name: "Bảo Tàng Mỹ Thuật", lat: 10.7698, lng: 106.6994, address: "97A Phó Đức Chính, Quận 1, TP. Hồ Chí Minh" },
];

async function main() {
  console.log("🚀 Starting order seeding...");

  // 1. Get ALL active stores
  const stores = await prisma.store.findMany({
    where: { isActive: true, isDeleted: false }
  });

  if (stores.length === 0) {
    console.error("❌ No active stores found. Please run main seed first.");
    return;
  }
  console.log(`Found ${stores.length} stores to distribute orders.`);

  // 2. Get a product
  const product = await prisma.product.findFirst();
  if (!product) {
    console.error("❌ No products found. Please run main seed first.");
    return;
  }
  console.log(`Using Product: ${product.name}`);

  // 2.5 Get customer
  const user = await prisma.user.findUnique({
    where: { email: "lapduy@gmail.com" }
  });
  if (!user) {
    console.error("❌ User lapduy@gmail.com not found.");
    return;
  }
  const customer = await prisma.customer.findFirst({
    where: { userId: user.id }
  });
  if (!customer) {
    console.error("❌ Customer for Gia Bảo not found.");
    return;
  }
  console.log(`Using Customer: ${customer.name || user.name} (${customer.id})`);

  // 3. Create Orders
  console.log(`Creating ${locations.length} orders...`);
  const orders = [];
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const orderCode = `ORD-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const order = await prisma.order.create({
      data: {
        orderCode,
        createdAt: new Date(Date.now() - (Math.floor(Math.random() * 56) + 5) * 60 * 1000),
        storeId: null, // <--- TESTED CONDITION: Null Store for Solver Assignment
        customerId: customer.id, // Link to customer
        type: OrderType.DELIVERY,
        status: OrderStatus.CONFIRMED,
        subtotal: 100000,
        total: 120000,
        serviceFee: 20000,
        items: {
          create: [{
            productId: product.id,
            name: product.name,
            price: product.basePrice,
            quantity: 1
          }]
        },
        delivery: {
          create: {
            storeId: null, // <--- TESTED CONDITION: Null Store for Solver Assignment
            receiverName: `Customer ${loc.name}`,
            receiverPhone: "0975875654",
            addressLine: loc.address,
            lat: loc.lat,
            lng: loc.lng
          }
        }
      }
    });
    orders.push(order);
    console.log(`- Created ${orderCode} with NULL storeId`);
  }
  console.log(`✅ Created ${orders.length} orders total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
