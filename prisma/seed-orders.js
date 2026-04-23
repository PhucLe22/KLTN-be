import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function seedOrders() {
  try {
    console.log("Starting order seed...");

    // Create store if not exists
    let store = await prisma.store.findFirst({ where: { isActive: true } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          code: "HCM01",
          name: "Store Ho Chi Minh",
          address: "123 Nguyen Hue, District 1, HCM",
          hotline: "0909123456",
          isActive: true,
        },
      });
      console.log("Store created:", store.name);
    }

    // Create customer if not exists
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      const userId = "bb3c5d8e-a5f9-4ea8-97d2-bf0ab93bc19d";
      const hashedPassword = await bcrypt.hash("customer123", 10);
      const user = await prisma.user.create({
        data: {
          id: userId,
          email: "customer@foodapp.com",
          password: hashedPassword,
          isActive: true,
        },
      });

      customer = await prisma.customer.create({
        data: {
          userId: user.id,
          name: "Nguyen Van Khach",
          phone: "0909123456",
          email: "customer@foodapp.com",
          tier: "BRONZE",
          points: 0,
          isActive: true,
        },
      });
      console.log("Customer created:", customer.name);
    }

    const products = await prisma.product.findMany({ where: { isActive: true }, take: 5 });
    if (products.length === 0) {
      throw new Error("No products found. Please seed products first.");
    }

    // Create orders
    const orders = [
      {
        storeId: store.id,
        customerId: customer.id,
        type: "DINE_IN",
        status: "COMPLETED",
        subtotal: 55000,
        discount: 0,
        tax: 4400,
        serviceFee: 0,
        total: 59400,
        note: "Bàn số 5",
        createdByStaffId: null,
        items: [
          {
            productId: products[0].id,
            name: products[0].name,
            sku: products[0].sku,
            price: products[0].basePrice,
            quantity: 2,
            tax: 4000,
            discount: 0,
          },
          {
            productId: products[1].id,
            name: products[1].name,
            sku: products[1].sku,
            price: products[1].basePrice,
            quantity: 1,
            tax: 400,
            discount: 0,
          },
        ],
      },
      {
        storeId: store.id,
        customerId: customer.id,
        type: "TAKEAWAY",
        status: "NEW",
        subtotal: 30000,
        discount: 0,
        tax: 2400,
        serviceFee: 0,
        total: 32400,
        note: null,
        createdByStaffId: null,
        items: [
          {
            productId: products[2].id,
            name: products[2].name,
            sku: products[2].sku,
            price: products[2].basePrice,
            quantity: 1,
            tax: 2400,
            discount: 0,
          },
        ],
      },
      {
        storeId: store.id,
        customerId: customer.id,
        type: "DELIVERY",
        status: "PREPARING",
        subtotal: 85000,
        discount: 5000,
        tax: 6400,
        serviceFee: 10000,
        total: 96400,
        note: "Giao trước 12h",
        createdByStaffId: null,
        items: [
          {
            productId: products[3].id,
            name: products[3].name,
            sku: products[3].sku,
            price: products[3].basePrice,
            quantity: 1,
            tax: 3600,
            discount: 0,
          },
          {
            productId: products[4].id,
            name: products[4].name,
            sku: products[4].sku,
            price: products[4].basePrice,
            quantity: 1,
            tax: 2800,
            discount: 5000,
          },
        ],
      },
    ];

    const createdOrders = [];
    for (const orderData of orders) {
      const { items, ...orderWithoutItems } = orderData;

      const order = await prisma.order.create({
        data: {
          ...orderWithoutItems,
          items: {
            create: items,
          },
        },
        include: {
          items: true,
          store: true,
          customer: true,
        },
      });

      createdOrders.push(order);
    }

    console.log(`Created ${createdOrders.length} orders`);
    console.log("Orders seeded successfully!");
  } catch (error) {
    console.error("Error seeding orders:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedOrders();
