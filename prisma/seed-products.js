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
        name: "Cà Phê",
        slug: "coffee",
        sortOrder: 1,
        isActive: true,
      },
    });

    const drinksCategory = await prisma.category.upsert({
      where: { slug: "drinks" },
      update: {},
      create: {
        name: "Thức Uống",
        slug: "drinks",
        sortOrder: 2,
        isActive: true,
      },
    });

    const milkteaCategory = await prisma.category.upsert({
      where: { slug: "milk-tea" },
      update: {},
      create: {
        name: "Trà Sữa",
        slug: "milk-tea",
        sortOrder: 3,
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
      drinks: ["Size", "Sugar Level", "Ice Level", "Toppings"],
      "milk-tea": ["Size", "Sugar Level", "Ice Level", "Toppings"]
    };

    // 3. Create Products (40 items)
    const products = [
      // Coffee (12 items)
      {
        sku: "CF001",
        name: "Espresso",
        description: "Cà phê đậm vị truyền thống Ý",
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
        description: "Cà phê với bọt sữa béo mịn",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "CF004",
        name: "Latte",
        description: "Cà phê sữa nóng thơm béo",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "CF005",
        name: "Mocha",
        description: "Cà phê socola ngọt ngào",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 48000,
        costPrice: 16000,
        taxRate: 8.00,
      },
      {
        sku: "CF006",
        name: "Cold Brew",
        description: "Cà phê ủ lạnh 12 giờ",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 35000,
        costPrice: 11000,
        taxRate: 8.00,
      },
      {
        sku: "CF007",
        name: "Cà Phê Sữa Đá",
        description: "Cà phê sữa đá thơm ngon kiểu Việt Nam",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 29000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "CF008",
        name: "Cà Phê Đen Đá",
        description: "Cà phê đen đá truyền thống đậm vị",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 22000,
        costPrice: 6000,
        taxRate: 8.00,
      },
      {
        sku: "CF009",
        name: "Bạc Xỉu",
        description: "Cà phê sữa trắng béo thơm",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 27000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "CF010",
        name: "Cà Phê Cốt Dừa",
        description: "Cà phê hòa quyện với nước cốt dừa béo ngậy",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 38000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "CF011",
        name: "Cà Phê Trứng",
        description: "Cà phê phin với lòng đỏ trứng đánh bông",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 35000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "CF012",
        name: "Affogato",
        description: "Kem vani nguyên bản với espresso nóng",
        categoryId: coffeeCategory.id,
        categorySlug: coffeeCategory.slug,
        basePrice: 42000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      // Drinks (12 items)
      {
        sku: "DR001",
        name: "Trà Đào Cam Sả",
        description: "Trà tươi hương đào cam sả mát lạnh",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 35000,
        costPrice: 10000,
        taxRate: 8.00,
      },
      {
        sku: "DR002",
        name: "Sinh Tố Bơ",
        description: "Sinh tố bơ sữa đặc thơm ngon",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "DR003",
        name: "Nước Ép Cam",
        description: "Nước ép cam tươi nguyên chất",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 30000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "DR004",
        name: "Yogurt Trái Cây",
        description: "Yogurt tươi với trái cây theo mùa",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "DR005",
        name: "Trà Xanh Mật Ong",
        description: "Trà xanh lá mật ong thanh mát",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 32000,
        costPrice: 9000,
        taxRate: 8.00,
      },
      {
        sku: "DR006",
        name: "Trà Atiso Đỏ",
        description: "Trà atiso đỏ giải nhiệt tốt cho sức khỏe",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 30000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      {
        sku: "DR007",
        name: "Sinh Tố Dâu",
        description: "Sinh tố dâu tây tươi mát lạnh",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 40000,
        costPrice: 14000,
        taxRate: 8.00,
      },
      {
        sku: "DR008",
        name: "Sinh Tố Xoài",
        description: "Sinh tố xoài chín ngọt thơm",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 40000,
        costPrice: 13000,
        taxRate: 8.00,
      },
      {
        sku: "DR009",
        name: "Nước Ép Dưa Hấu",
        description: "Nước ép dưa hấu tươi mát",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 28000,
        costPrice: 7000,
        taxRate: 8.00,
      },
      {
        sku: "DR010",
        name: "Soda Chanh",
        description: "Soda chanh tươi giải khát sảng khoái",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 25000,
        costPrice: 6000,
        taxRate: 8.00,
      },
      {
        sku: "DR011",
        name: "Sữa Chua Uống",
        description: "Sữa chua uống men sống tốt cho tiêu hóa",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 25000,
        costPrice: 7000,
        taxRate: 8.00,
      },
      {
        sku: "DR012",
        name: "Nước Ép Cà Rốt",
        description: "Nước ép cà rốt tươi giàu vitamin A",
        categoryId: drinksCategory.id,
        categorySlug: drinksCategory.slug,
        basePrice: 30000,
        costPrice: 8000,
        taxRate: 8.00,
      },
      // Milk Tea (16 items)
      {
        sku: "MT001",
        name: "Trà Sữa Trân Châu",
        description: "Trà sữa truyền thống với trân châu đen dẻo",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 35000,
        costPrice: 10000,
        taxRate: 8.00,
      },
      {
        sku: "MT002",
        name: "Trà Sữa Socola",
        description: "Trà sữa vị socola béo ngậy",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "MT003",
        name: "Trà Sữa Matcha",
        description: "Trà sữa matcha Nhật Bản thơm ngon",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 45000,
        costPrice: 14000,
        taxRate: 8.00,
      },
      {
        sku: "MT004",
        name: "Trà Sữa Khoai Môn",
        description: "Trà sữa khoai môn tím đặc biệt",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 42000,
        costPrice: 13000,
        taxRate: 8.00,
      },
      {
        sku: "MT005",
        name: "Trà Sữa Thái Xanh",
        description: "Trà sữa Thái Xanh đậm vị béo",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 38000,
        costPrice: 11000,
        taxRate: 8.00,
      },
      {
        sku: "MT006",
        name: "Trà Sữa Caramel",
        description: "Trà sữa caramel ngọt ngào hấp dẫn",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "MT007",
        name: "Trà Sữa Dâu Tây",
        description: "Trà sữa dâu tây chua ngọt thơm ngon",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 42000,
        costPrice: 13000,
        taxRate: 8.00,
      },
      {
        sku: "MT008",
        name: "Trà Sữa Hạnh Nhân",
        description: "Trà sữa hạnh nhân béo bùi đặc biệt",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 42000,
        costPrice: 13000,
        taxRate: 8.00,
      },
      {
        sku: "MT009",
        name: "Trà Sữa Oolong",
        description: "Trà sữa oolong thơm hương hoa nhài",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "MT010",
        name: "Trà Sữa Sầu Riêng",
        description: "Trà sữa sầu riêng thơm nồng đặc trưng",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "MT011",
        name: "Trà Sữa Chocolate Đen",
        description: "Trà sữa chocolate đen 70% nguyên chất",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 42000,
        costPrice: 14000,
        taxRate: 8.00,
      },
      {
        sku: "MT012",
        name: "Trà Sữa Dừa Non",
        description: "Trà sữa dừa non thanh mát béo nhẹ",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 40000,
        costPrice: 12000,
        taxRate: 8.00,
      },
      {
        sku: "MT013",
        name: "Trà Sữa Đậu Đỏ",
        description: "Trà sữa đậu đỏ bùi béo thơm ngon",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 38000,
        costPrice: 11000,
        taxRate: 8.00,
      },
      {
        sku: "MT014",
        name: "Trà Sữa Phô Mai",
        description: "Trà sữa phô mai mặn ngọt độc đáo",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 45000,
        costPrice: 15000,
        taxRate: 8.00,
      },
      {
        sku: "MT015",
        name: "Matcha Đá Xay",
        description: "Matcha đá xay kem béo thơm mát",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 48000,
        costPrice: 16000,
        taxRate: 8.00,
      },
      {
        sku: "MT016",
        name: "Socola Đá Xay",
        description: "Socola đá xay với kem tươi béo ngậy",
        categoryId: milkteaCategory.id,
        categorySlug: milkteaCategory.slug,
        basePrice: 48000,
        costPrice: 16000,
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
    console.log(`   - Categories: 3 (Cà Phê, Thức Uống, Trà Sữa)`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Coffee: 12 | Drinks: 12 | Milk Tea: 16`);
    console.log(`   - Option Groups Linked: ${allGroups.length}`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
