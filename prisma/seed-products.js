import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function seedProducts() {
  try {
    console.log("🌱 Starting product seed...");

    // 1. Create Categories
    const coffeeCategory = await prisma.category.upsert({
      where: { slug: "coffee" },
      update: {},
      create: {
        name: "Coffee",
        slug: "coffee",
        sortOrder: 1,
        isActive: true,
      },
    });

    const drinksCategory = await prisma.category.upsert({
      where: { slug: "drinks" },
      update: {},
      create: {
        name: "Drinks",
        slug: "drinks",
        sortOrder: 2,
        isActive: true,
      },
    });

    console.log("✅ Categories created");

    // 2. Create OptionGroup (Size)
    const sizeGroup = await prisma.optionGroup.upsert({
      where: { id: "size-group-id" },
      update: {},
      create: {
        id: "size-group-id",
        name: "Size",
        isRequired: true,
        isMultiple: false,
        sortOrder: 1,
        isActive: true,
      },
    });

    // Create Size options
    const sizeOptions = await Promise.all([
      prisma.productOption.upsert({
        where: { id: "size-s" },
        update: {},
        create: {
          id: "size-s",
          groupId: sizeGroup.id,
          name: "S",
          basePrice: 0,
          sortOrder: 1,
          isActive: true,
        },
      }),
      prisma.productOption.upsert({
        where: { id: "size-m" },
        update: {},
        create: {
          id: "size-m",
          groupId: sizeGroup.id,
          name: "M",
          basePrice: 5000,
          sortOrder: 2,
          isActive: true,
        },
      }),
      prisma.productOption.upsert({
        where: { id: "size-l" },
        update: {},
        create: {
          id: "size-l",
          groupId: sizeGroup.id,
          name: "L",
          basePrice: 10000,
          sortOrder: 3,
          isActive: true,
        },
      }),
    ]);

    console.log("✅ Size options created");

    // 3. Create Products (10 items)
    const products = [
      // Coffee (6 items)
      {
        sku: "CF001",
        name: "Espresso",
        description: "Cà phê đậm vị truyền thống",
        categoryId: coffeeCategory.id,
        basePrice: 25000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "CF002",
        name: "Americano",
        description: "Cà phê pha máy với nước nóng",
        categoryId: coffeeCategory.id,
        basePrice: 30000,
        costPrice: 10000,
        taxRate: 8.00,
      },
      {
        sku: "CF003",
        name: "Cappuccino",
        description: "Cà phê với bọt sữa dày",
        categoryId: coffeeCategory.id,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "CF004",
        name: "Latte",
        description: "Cà phê với sữa nhiều",
        categoryId: coffeeCategory.id,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "CF005",
        name: "Mocha",
        description: "Cà phê với chocolate",
        categoryId: coffeeCategory.id,
        basePrice: 48000,
        costPrice: 16000,
        taxRate: 8.00,
      },
      {
        sku: "CF006",
        name: "Cold Brew",
        description: "Cà phê ngâm lạnh 12h",
        categoryId: coffeeCategory.id,
        basePrice: 35000,
        costPrice: 11000,
        taxRate: 8.00,
      },
      // Drinks (4 items)
      {
        sku: "DR001",
        name: "Trà Đào Cam Sả",
        description: "Trà tươi với đào và cam sả",
        categoryId: drinksCategory.id,
        basePrice: 35000,
        costPrice: 10000,
        taxRate: 8.00,
      },
      {
        sku: "DR002",
        name: "Sinh Tố Bơ",
        description: "Sinh tố bơ creamy",
        categoryId: drinksCategory.id,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "DR003",
        name: "Nước Ép Cam",
        description: "Nước ép cam tươi",
        categoryId: drinksCategory.id,
        basePrice: 30000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "DR004",
        name: "Yogurt Trái Cây",
        description: "Yogurt với trái cây tươi",
        categoryId: drinksCategory.id,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
    ];

    const createdProducts = [];
    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {},
        create: {
          ...productData,
          type: "SIMPLE",
          isActive: true,
        },
      });
      createdProducts.push(product);
    }

    console.log(`✅ Created ${createdProducts.length} products`);

    // 4. Link Products to Size OptionGroup
    for (const product of createdProducts) {
      await prisma.productOptionGroup.upsert({
        where: {
          productId_optionGroupId: {
            productId: product.id,
            optionGroupId: sizeGroup.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          optionGroupId: sizeGroup.id,
          sortOrder: 1,
        },
      });

      // Link each size option to product with custom pricing
      for (const option of sizeOptions) {
        await prisma.productOptionValue.upsert({
          where: {
            productId_optionId: {
              productId: product.id,
              optionId: option.id,
            },
          },
          update: {},
          create: {
            productId: product.id,
            optionId: option.id,
            price: option.basePrice,
          },
        });
      }
    }

    console.log("✅ Products linked to size options");

    console.log("🎉 Products seeded successfully!");
    console.log(`\n📋 Summary:`);
    console.log(`   - Categories: 2 (Coffee, Drinks)`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Size Options: 3 (S, M, L)`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
