import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function seedOptionGroups() {
  try {
    console.log("🌱 Starting option groups seed...");

    // 0. Size (UUID: 550e8400-e29b-41d4-a716-446655440001)
    const sizeGroup = await prisma.optionGroup.upsert({
      where: { id: "550e8400-e29b-41d4-a716-446655440001" },
      update: {},
      create: {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Size",
        isRequired: true,
        isMultiple: false,
        sortOrder: 1,
        isActive: true,
      },
    });

    const sizeOptions = [
      { id: "550e8400-e29b-41d4-a716-446655440101", name: "S", price: 0 },
      { id: "550e8400-e29b-41d4-a716-446655440102", name: "M", price: 5000 },
      { id: "550e8400-e29b-41d4-a716-446655440103", name: "L", price: 10000 },
    ];

    for (let i = 0; i < sizeOptions.length; i++) {
      await prisma.productOption.upsert({
        where: { id: sizeOptions[i].id },
        update: {},
        create: {
          id: sizeOptions[i].id,
          groupId: sizeGroup.id,
          name: sizeOptions[i].name,
          basePrice: sizeOptions[i].price,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log("✅ Size options created");

    // 1. Sugar Level (UUID: 550e8400-e29b-41d4-a716-446655440002)
    const sugarGroup = await prisma.optionGroup.upsert({
      where: { id: "550e8400-e29b-41d4-a716-446655440002" },
      update: {},
      create: {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Sugar Level",
        isRequired: true,
        isMultiple: false,
        sortOrder: 2,
        isActive: true,
      },
    });

    const sugarOptions = [
      { id: "550e8400-e29b-41d4-a716-446655440201", name: "0% (Không Đường)" },
      { id: "550e8400-e29b-41d4-a716-446655440202", name: "30% (Ít Ngọt)" },
      { id: "550e8400-e29b-41d4-a716-446655440203", name: "50% (Nửa Ngọt)" },
      { id: "550e8400-e29b-41d4-a716-446655440204", name: "70% (Ngọt)" },
      { id: "550e8400-e29b-41d4-a716-446655440205", name: "100% (Rất Ngọt)" },
    ];

    for (let i = 0; i < sugarOptions.length; i++) {
      await prisma.productOption.upsert({
        where: { id: sugarOptions[i].id },
        update: {},
        create: {
          id: sugarOptions[i].id,
          groupId: sugarGroup.id,
          name: sugarOptions[i].name,
          basePrice: 0,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log("✅ Sugar Level options created");

    // 2. Ice Level (UUID: 550e8400-e29b-41d4-a716-446655440003)
    const iceGroup = await prisma.optionGroup.upsert({
      where: { id: "550e8400-e29b-41d4-a716-446655440003" },
      update: {},
      create: {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Ice Level",
        isRequired: true,
        isMultiple: false,
        sortOrder: 3,
        isActive: true,
      },
    });

    const iceOptions = [
      { id: "550e8400-e29b-41d4-a716-446655440301", name: "Không Đá" },
      { id: "550e8400-e29b-41d4-a716-446655440302", name: "Ít Đá" },
      { id: "550e8400-e29b-41d4-a716-446655440303", name: "Đá Thường" },
    ];

    for (let i = 0; i < iceOptions.length; i++) {
      await prisma.productOption.upsert({
        where: { id: iceOptions[i].id },
        update: {},
        create: {
          id: iceOptions[i].id,
          groupId: iceGroup.id,
          name: iceOptions[i].name,
          basePrice: 0,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log("✅ Ice Level options created");

    // 3. Toppings (UUID: 550e8400-e29b-41d4-a716-446655440004)
    const toppingGroup = await prisma.optionGroup.upsert({
      where: { id: "550e8400-e29b-41d4-a716-446655440004" },
      update: {},
      create: {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Toppings",
        isRequired: false,
        isMultiple: true,
        sortOrder: 4,
        isActive: true,
      },
    });

    const toppings = [
      { id: "550e8400-e29b-41d4-a716-446655440401", name: "Trân Châu Đen", price: 5000 },
      { id: "550e8400-e29b-41d4-a716-446655440402", name: "Trân Châu Trắng", price: 7000 },
      { id: "550e8400-e29b-41d4-a716-446655440403", name: "Thạch Lá Dứa", price: 5000 },
      { id: "550e8400-e29b-41d4-a716-446655440404", name: "Nha Đam", price: 8000 },
      { id: "550e8400-e29b-41d4-a716-446655440405", name: "Bánh Flan", price: 10000 },
    ];

    for (let i = 0; i < toppings.length; i++) {
      await prisma.productOption.upsert({
        where: { id: toppings[i].id },
        update: {},
        create: {
          id: toppings[i].id,
          groupId: toppingGroup.id,
          name: toppings[i].name,
          basePrice: toppings[i].price,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log("✅ Topping options created");

    console.log("🎉 Option groups seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding option groups:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedOptionGroups();
