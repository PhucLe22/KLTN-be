import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { OrderStatus, OrderType } from "../constants/enum.js";

const locations = [
  { name: "Bitexco Financial Tower", lat: 10.7715, lng: 106.7042, address: "2 Hai Trieu, District 1, HCMC" },
  { name: "Landmark 81", lat: 10.7950, lng: 106.7219, address: "720A Dien Bien Phu, Binh Thanh, HCMC" },
  { name: "Notre Dame Cathedral", lat: 10.7797, lng: 106.6990, address: "1 Cong xa Paris, District 1, HCMC" },
  { name: "Ben Thanh Market", lat: 10.7725, lng: 106.6980, address: "Le Loi, District 1, HCMC" },
  { name: "War Remnants Museum", lat: 10.7795, lng: 106.6921, address: "28 Vo Van Tan, District 3, HCMC" },
  { name: "Vinhomes Central Park", lat: 10.7936, lng: 106.7203, address: "208 Nguyen Huu Canh, Binh Thanh, HCMC" },
  { name: "Dragon Wharf", lat: 10.7681, lng: 106.7068, address: "1 Nguyen Tat Thanh, District 4, HCMC" },
  { name: "Tao Dan Park", lat: 10.7745, lng: 106.6922, address: "Truong Dinh, District 1, HCMC" },
  { name: "Saigon Zoo", lat: 10.7875, lng: 106.7052, address: "2 Nguyen Binh Khiem, District 1, HCMC" },
  { name: "Tan Dinh Church", lat: 10.7884, lng: 106.6908, address: "281 Hai Ba Trung, District 3, HCMC" },
  { name: "Independence Palace", lat: 10.7770, lng: 106.6953, address: "135 Nam Ky Khoi Nghia, District 1, HCMC" },
  { name: "Saigon Opera House", lat: 10.7766, lng: 106.7032, address: "7 Cong Truong Lam Son, District 1, HCMC" },
  { name: "Turtle Lake", lat: 10.7827, lng: 106.6960, address: "Cong Truong Quoc Te, District 3, HCMC" },
  { name: "Gia Dinh Park", lat: 10.8116, lng: 106.6778, address: "Hoang Minh Giam, Phu Nhuan, HCMC" },
  { name: "HCMC Fine Arts Museum", lat: 10.7698, lng: 106.6994, address: "97A Pho Duc Chinh, District 1, HCMC" },
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

  // 2.5 Get a customer
  const customer = await prisma.customer.findFirst({
    where: { isActive: true }
  });
  if (!customer) {
    console.error("❌ No customers found. Please run main seed first.");
    return;
  }
  console.log(`Using Customer: ${customer.name} (${customer.id})`);

  // 3. Create Orders
  console.log(`Creating ${locations.length} orders across ${stores.length} stores...`);
  const orders = [];
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const store = stores[i % stores.length]; // Distribute orders across stores
    const orderCode = `ORD-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const order = await prisma.order.create({
      data: {
        orderCode,
        storeId: store.id,
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
            storeId: store.id,
            receiverName: `Customer ${loc.name}`,
            receiverPhone: "0900000000",
            addressLine: loc.address,
            lat: loc.lat,
            lng: loc.lng
          }
        }
      }
    });
    orders.push(order);
    console.log(`- Created ${orderCode} for store: ${store.name}`);
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
