import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import {  createSlug } from "../lib/helpers.js";

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

    // 2. Fetch all Option Groups and their options
    const allGroups = await prisma.optionGroup.findMany({
      include: { options: true }
    });
    console.log(`✅ Fetched ${allGroups.length} option groups`);

    // Define mapping of Category Slug to Option Group Names
    const CATEGORY_OPTIONS_MAP = {
      coffee: ["Size", "Sugar Level", "Ice Level"],
      drinks: ["Size", "Sugar Level", "Ice Level", "Toppings"]
    };

    // 3. Create Products (10 items)
    const products = [
      // ... (products list remains same)
      // Coffee (6 items)
      {
        sku: "CF001",
        name: "Espresso",
        description: "Cà phê đậm vị truyền thống",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 25000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "CF002",
        name: "Americano",
        description: "Cà phê pha máy với nước nóng",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 30000,
        costPrice: 10000,
        taxRate: 8.00,
      },
      {
        sku: "CF003",
        name: "Cappuccino",
        description: "Cà phê với bọt sữa dày",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "CF004",
        name: "Latte",
        description: "Cà phê với sữa nhiều",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "CF005",
        name: "Mocha",
        description: "Cà phê với chocolate",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 48000,
        costPrice: 16000,
        taxRate: 8.00,
      },
      {
        sku: "CF006",
        name: "Cold Brew",
        description: "Cà phê ngâm lạnh 12h",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
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
        categorySlug: drinksCategory.slug,
        basePrice: 35000,
        costPrice: 10000,
        taxRate: 8.00,
      },
      {
        sku: "DR002",
        name: "Sinh Tố Bơ",
        description: "Sinh tố bơ creamy",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "DR003",
        name: "Nước Ép Cam",
        description: "Nước ép cam tươi",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 30000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "DR004",
        name: "Yogurt Trái Cây",
        description: "Yogurt với trái cây tươi",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
    ];

    const createdProducts = [];
    for (const productData of products) {
      const slug = await createSlug(prisma.product, productData.name);
      const product = await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {
          slug
        },
        create: {
          sku: productData.sku,
          name: productData.name,
          description: productData.description,
          categoryId: productData.categoryId,
          basePrice: productData.basePrice,
          costPrice: productData.costPrice,
          taxRate: productData.taxRate,
          slug,
          type: "SIMPLE",
          isActive: true,
        },
      });
      // Attach categorySlug for mapping
      createdProducts.push({ ...product, categorySlug: productData.categorySlug });
    }

    console.log(`✅ Created ${createdProducts.length} products`);

    // 4. Link Products to Relevant OptionGroups
    for (const product of createdProducts) {
      const allowedGroupNames = CATEGORY_OPTIONS_MAP[product.categorySlug] || [];
      const relevantGroups = allGroups.filter(g => allowedGroupNames.includes(g.name));

      for (const group of relevantGroups) {
        // Link Product to OptionGroup
        await prisma.productOptionGroup.upsert({
          where: {
            productId_optionGroupId: {
              productId: product.id,
              optionGroupId: group.id,
            },
          },
          update: {},
          create: {
            productId: product.id,
            optionGroupId: group.id,
            sortOrder: group.sortOrder,
          },
        });

        // Link each option to product with default pricing
        for (const option of group.options) {
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
    }

    console.log("✅ Products linked to all option groups");

    console.log("🎉 Products seeded successfully!");
    console.log(`\n📋 Summary:`);
    console.log(`   - Categories: 2 (Coffee, Drinks)`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Option Groups Linked: ${allGroups.length}`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
