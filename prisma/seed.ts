/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 เริ่มสร้างข้อมูลตัวอย่าง...");

  // =============================================
  // สร้างวัตถุดิบ (Ingredients)
  // =============================================
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { id: "ing_soda" },
      update: {},
      create: {
        id: "ing_soda",
        name: "โซดา",
        unit: "ml",
        costPerUnit: 0.05, // 0.05 บาท/ml
        currentStock: 10000,
        minStock: 2000,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "ing_butterscotch" },
      update: {},
      create: {
        id: "ing_butterscotch",
        name: "ไซรัปบัตเตอร์สก็อต",
        unit: "ml",
        costPerUnit: 0.3, // 0.30 บาท/ml
        currentStock: 5000,
        minStock: 1000,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "ing_cream" },
      update: {},
      create: {
        id: "ing_cream",
        name: "วิปครีม",
        unit: "g",
        costPerUnit: 0.2, // 0.20 บาท/g
        currentStock: 3000,
        minStock: 500,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "ing_cup" },
      update: {},
      create: {
        id: "ing_cup",
        name: "แก้ว 16 oz",
        unit: "piece",
        costPerUnit: 3.5, // 3.50 บาท/ใบ
        currentStock: 500,
        minStock: 100,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "ing_straw" },
      update: {},
      create: {
        id: "ing_straw",
        name: "หลอด",
        unit: "piece",
        costPerUnit: 0.5, // 0.50 บาท/อัน
        currentStock: 1000,
        minStock: 200,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "ing_caramel" },
      update: {},
      create: {
        id: "ing_caramel",
        name: "ซอสคาราเมล",
        unit: "ml",
        costPerUnit: 0.25,
        currentStock: 2000,
        minStock: 500,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "ing_boba" },
      update: {},
      create: {
        id: "ing_boba",
        name: "ไข่มุก",
        unit: "g",
        costPerUnit: 0.15,
        currentStock: 5000,
        minStock: 1000,
      },
    }),
  ]);

  console.log(`✅ สร้างวัตถุดิบ ${ingredients.length} รายการ`);

  // =============================================
  // สร้างหมวดหมู่ (Categories)
  // =============================================
  const catDrinks = await prisma.category.upsert({
    where: { name: "เครื่องดื่ม" },
    update: {},
    create: { name: "เครื่องดื่ม", sortOrder: 1, color: "#795548" },
  });

  const catSnacks = await prisma.category.upsert({
    where: { name: "ของหวาน" },
    update: {},
    create: { name: "ของหวาน", sortOrder: 2, color: "#FF9800" },
  });

  const catPromotion = await prisma.category.upsert({
    where: { name: "โปรโมชั่น" },
    update: {},
    create: { name: "โปรโมชั่น", sortOrder: 3, color: "#FFC107" },
  });

  console.log("✅ สร้างหมวดหมู่");

  // =============================================
  // สร้างสินค้า (Products)
  // =============================================
  const butterBeerClassic = await prisma.product.upsert({
    where: { id: "prod_classic" },
    update: {},
    create: {
      id: "prod_classic",
      name: "Butter Beer Classic",
      nameTh: "บัตเตอร์เบียร์ คลาสสิค",
      price: 79,
      categoryId: catDrinks.id,
      isActive: true,
    },
  });

  const butterBeerCaramel = await prisma.product.upsert({
    where: { id: "prod_caramel" },
    update: {},
    create: {
      id: "prod_caramel",
      name: "Butter Beer Caramel",
      nameTh: "บัตเตอร์เบียร์ คาราเมล",
      price: 89,
      categoryId: catDrinks.id,
      isActive: true,
    },
  });

  const butterBeerBoba = await prisma.product.upsert({
    where: { id: "prod_boba" },
    update: {},
    create: {
      id: "prod_boba",
      name: "Butter Beer Boba",
      nameTh: "บัตเตอร์เบียร์ ไข่มุก",
      price: 99,
      categoryId: catDrinks.id,
      isActive: true,
    },
  });

  console.log("✅ สร้างสินค้า 3 รายการ");

  // =============================================
  // สร้างสูตร (Recipes) - Classic
  // =============================================
  await Promise.all([
    // Classic Recipe
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerClassic.id,
          ingredientId: "ing_soda",
        },
      },
      update: {},
      create: {
        productId: butterBeerClassic.id,
        ingredientId: "ing_soda",
        amountUsed: 200, // 200ml โซดา
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerClassic.id,
          ingredientId: "ing_butterscotch",
        },
      },
      update: {},
      create: {
        productId: butterBeerClassic.id,
        ingredientId: "ing_butterscotch",
        amountUsed: 30, // 30ml ไซรัป
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerClassic.id,
          ingredientId: "ing_cream",
        },
      },
      update: {},
      create: {
        productId: butterBeerClassic.id,
        ingredientId: "ing_cream",
        amountUsed: 20, // 20g วิปครีม
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerClassic.id,
          ingredientId: "ing_cup",
        },
      },
      update: {},
      create: {
        productId: butterBeerClassic.id,
        ingredientId: "ing_cup",
        amountUsed: 1, // 1 แก้ว
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerClassic.id,
          ingredientId: "ing_straw",
        },
      },
      update: {},
      create: {
        productId: butterBeerClassic.id,
        ingredientId: "ing_straw",
        amountUsed: 1, // 1 หลอด
      },
    }),
  ]);

  // Caramel Recipe (เพิ่มซอสคาราเมล)
  await Promise.all([
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerCaramel.id,
          ingredientId: "ing_soda",
        },
      },
      update: {},
      create: {
        productId: butterBeerCaramel.id,
        ingredientId: "ing_soda",
        amountUsed: 200,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerCaramel.id,
          ingredientId: "ing_butterscotch",
        },
      },
      update: {},
      create: {
        productId: butterBeerCaramel.id,
        ingredientId: "ing_butterscotch",
        amountUsed: 30,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerCaramel.id,
          ingredientId: "ing_caramel",
        },
      },
      update: {},
      create: {
        productId: butterBeerCaramel.id,
        ingredientId: "ing_caramel",
        amountUsed: 15, // +15ml ซอสคาราเมล
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerCaramel.id,
          ingredientId: "ing_cream",
        },
      },
      update: {},
      create: {
        productId: butterBeerCaramel.id,
        ingredientId: "ing_cream",
        amountUsed: 25,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerCaramel.id,
          ingredientId: "ing_cup",
        },
      },
      update: {},
      create: {
        productId: butterBeerCaramel.id,
        ingredientId: "ing_cup",
        amountUsed: 1,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerCaramel.id,
          ingredientId: "ing_straw",
        },
      },
      update: {},
      create: {
        productId: butterBeerCaramel.id,
        ingredientId: "ing_straw",
        amountUsed: 1,
      },
    }),
  ]);

  // Boba Recipe (เพิ่มไข่มุก)
  await Promise.all([
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerBoba.id,
          ingredientId: "ing_soda",
        },
      },
      update: {},
      create: {
        productId: butterBeerBoba.id,
        ingredientId: "ing_soda",
        amountUsed: 200,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerBoba.id,
          ingredientId: "ing_butterscotch",
        },
      },
      update: {},
      create: {
        productId: butterBeerBoba.id,
        ingredientId: "ing_butterscotch",
        amountUsed: 30,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerBoba.id,
          ingredientId: "ing_boba",
        },
      },
      update: {},
      create: {
        productId: butterBeerBoba.id,
        ingredientId: "ing_boba",
        amountUsed: 50, // +50g ไข่มุก
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerBoba.id,
          ingredientId: "ing_cream",
        },
      },
      update: {},
      create: {
        productId: butterBeerBoba.id,
        ingredientId: "ing_cream",
        amountUsed: 20,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerBoba.id,
          ingredientId: "ing_cup",
        },
      },
      update: {},
      create: {
        productId: butterBeerBoba.id,
        ingredientId: "ing_cup",
        amountUsed: 1,
      },
    }),
    prisma.recipeItem.upsert({
      where: {
        productId_ingredientId: {
          productId: butterBeerBoba.id,
          ingredientId: "ing_straw",
        },
      },
      update: {},
      create: {
        productId: butterBeerBoba.id,
        ingredientId: "ing_straw",
        amountUsed: 1,
      },
    }),
  ]);

  console.log("✅ สร้างสูตรการผลิตทั้งหมด");

  // =============================================
  // สร้าง Toppings
  // =============================================
  const toppings = await Promise.all([
    prisma.topping.upsert({
      where: { id: "top_whip_extra" },
      update: {},
      create: {
        id: "top_whip_extra",
        name: "Extra Whip Cream",
        nameTh: "วิปครีมเพิ่ม",
        price: 10,
      },
    }),
    prisma.topping.upsert({
      where: { id: "top_butterscotch" },
      update: {},
      create: {
        id: "top_butterscotch",
        name: "Extra Butterscotch",
        nameTh: "บัตเตอร์สก็อตเพิ่ม",
        price: 15,
      },
    }),
    prisma.topping.upsert({
      where: { id: "top_boba" },
      update: {},
      create: {
        id: "top_boba",
        name: "Boba",
        nameTh: "ไข่มุก",
        price: 15,
      },
    }),
    prisma.topping.upsert({
      where: { id: "top_caramel" },
      update: {},
      create: {
        id: "top_caramel",
        name: "Caramel Drizzle",
        nameTh: "ซอสคาราเมล",
        price: 10,
      },
    }),
  ]);

  console.log(`✅ สร้าง Toppings ${toppings.length} รายการ`);

  // =============================================
  // สร้าง Admin User (ถ้ายังไม่มี)
  // =============================================
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@germanoneday.com" },
    update: {},
    create: {
      email: "admin@germanoneday.com",
      name: "Admin",
      role: "ADMIN",
    },
  });

  const adminUser2 = await prisma.user.upsert({
    where: { email: "rawiponponsarutwanit@gmail.com" },
    update: {},
    create: {
      email: "rawiponponsarutwanit@gmail.com",
      name: "Rawipon",
      role: "ADMIN",
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "rawipon.po@ku.th" },
    update: {},
    create: {
      email: "rawipon.po@ku.th",
      name: "Rawipon Staff",
      role: "STAFF",
    },
  });

  console.log(`✅ สร้าง Admin User: ${adminUser.email}`);
  console.log(`✅ สร้าง Admin User: ${adminUser2.email}`);
  console.log(`✅ สร้าง Staff User: ${staffUser.email}`);

  // =============================================
  // คำนวณต้นทุนตัวอย่าง
  // =============================================
  console.log("\n📊 ต้นทุนสินค้า:");

  const products = await prisma.product.findMany({
    include: {
      recipe: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  for (const product of products) {
    const cost = product.recipe.reduce((sum, item) => {
      return sum + item.amountUsed * item.ingredient.costPerUnit;
    }, 0);
    const profit = product.price - cost;
    const margin = ((profit / product.price) * 100).toFixed(1);

    console.log(
      `   ${product.nameTh}: ราคา ${product.price}฿ | ต้นทุน ${cost.toFixed(2)}฿ | กำไร ${profit.toFixed(2)}฿ (${margin}%)`,
    );
  }

  console.log("\n🎉 Seed สำเร็จ!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
