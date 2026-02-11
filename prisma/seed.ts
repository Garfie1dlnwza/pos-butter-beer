/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🍺 เริ่มสร้างข้อมูล Butter Beer Shop...\n");

  // // =============================================
  // // สร้างวัตถุดิบ (Ingredients)
  // // =============================================
  // console.log("📦 สร้างวัตถุดิบ...");

  // const ingredients = await Promise.all([
  //   // เครื่องดื่ม
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_soda" },
  //     update: {},
  //     create: {
  //       id: "ing_soda",
  //       name: "โซดา",
  //       unit: "ขวด",
  //       costPerUnit: 15, // 15 บาท/ขวด (1.5L)
  //       currentStock: 100,
  //       minStock: 20,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_butterscotch" },
  //     update: {},
  //     create: {
  //       id: "ing_butterscotch",
  //       name: "ไซรัปบัตเตอร์สก็อต",
  //       unit: "ขวด",
  //       costPerUnit: 350, // 350 บาท/ขวด (750ml)
  //       currentStock: 10,
  //       minStock: 3,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_cream" },
  //     update: {},
  //     create: {
  //       id: "ing_cream",
  //       name: "วิปครีม",
  //       unit: "กระป๋อง",
  //       costPerUnit: 120, // 120 บาท/กระป๋อง
  //       currentStock: 20,
  //       minStock: 5,
  //     },
  //   }),

  //   // บรรจุภัณฑ์
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_cup_14oz" },
  //     update: {},
  //     create: {
  //       id: "ing_cup_14oz",
  //       name: "แก้ว 14 oz",
  //       unit: "ใบ",
  //       costPerUnit: 3.5, // 3.50 บาท/ใบ
  //       currentStock: 500,
  //       minStock: 100,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_cup_16oz" },
  //     update: {},
  //     create: {
  //       id: "ing_cup_16oz",
  //       name: "แก้ว 16 oz",
  //       unit: "ใบ",
  //       costPerUnit: 4.0, // 4 บาท/ใบ
  //       currentStock: 500,
  //       minStock: 100,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_lid" },
  //     update: {},
  //     create: {
  //       id: "ing_lid",
  //       name: "ฝาแก้ว",
  //       unit: "ใบ",
  //       costPerUnit: 1.5, // 1.50 บาท/ใบ
  //       currentStock: 1000,
  //       minStock: 200,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_straw" },
  //     update: {},
  //     create: {
  //       id: "ing_straw",
  //       name: "หลอด",
  //       unit: "อัน",
  //       costPerUnit: 0.5, // 0.50 บาท/อัน
  //       currentStock: 1000,
  //       minStock: 200,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_ice" },
  //     update: {},
  //     create: {
  //       id: "ing_ice",
  //       name: "น้ำแข็ง",
  //       unit: "ถุง",
  //       costPerUnit: 25, // 25 บาท/ถุง (3kg)
  //       currentStock: 50,
  //       minStock: 10,
  //     },
  //   }),

  //   // ของตกแต่ง/อุปกรณ์
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_vinyl" },
  //     update: {},
  //     create: {
  //       id: "ing_vinyl",
  //       name: "ไวนิล (ป้ายโฆษณา)",
  //       unit: "แผ่น",
  //       costPerUnit: 500, // 500 บาท/แผ่น
  //       currentStock: 5,
  //       minStock: 2,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_sticker" },
  //     update: {},
  //     create: {
  //       id: "ing_sticker",
  //       name: "สติ๊กเกอร์แบรนด์",
  //       unit: "แผ่น",
  //       costPerUnit: 3, // 3 บาท/แผ่น
  //       currentStock: 500,
  //       minStock: 100,
  //     },
  //   }),
  //   prisma.ingredient.upsert({
  //     where: { id: "ing_sign" },
  //     update: {},
  //     create: {
  //       id: "ing_sign",
  //       name: "ป้ายราคา/เมนู",
  //       unit: "อัน",
  //       costPerUnit: 50, // 50 บาท/อัน
  //       currentStock: 20,
  //       minStock: 5,
  //     },
  //   }),
  // ]);

  // console.log(`   ✅ สร้างวัตถุดิบ ${ingredients.length} รายการ`);

  // // =============================================
  // // สร้างหมวดหมู่ (Categories)
  // // =============================================
  // console.log("\n🏷️ สร้างหมวดหมู่...");

  // const catDrinks = await prisma.category.upsert({
  //   where: { name: "เครื่องดื่ม" },
  //   update: {},
  //   create: { name: "เครื่องดื่ม", sortOrder: 1, color: "#8D6E63" },
  // });

  // const catPromotion = await prisma.category.upsert({
  //   where: { name: "โปรโมชั่น" },
  //   update: {},
  //   create: { name: "โปรโมชั่น", sortOrder: 2, color: "#E91E63" },
  // });

  // console.log("   ✅ สร้างหมวดหมู่ 2 รายการ");

  // // =============================================
  // // สร้างสินค้า (Products)
  // // =============================================
  // console.log("\n🍺 สร้างเมนูสินค้า...");

  // // เครื่องดื่มหลัก
  // const butterBeer14 = await prisma.product.upsert({
  //   where: { id: "prod_bb_14oz" },
  //   update: {},
  //   create: {
  //     id: "prod_bb_14oz",
  //     name: "Butter Beer 14oz",
  //     nameTh: "บัตเตอร์เบียร์ 14oz",
  //     price: 89,
  //     cost: 25, // ต้นทุนประมาณ 25 บาท
  //     categoryId: catDrinks.id,
  //     isActive: true,
  //   },
  // });

  // const butterBeer16 = await prisma.product.upsert({
  //   where: { id: "prod_bb_16oz" },
  //   update: {},
  //   create: {
  //     id: "prod_bb_16oz",
  //     name: "Butter Beer 16oz",
  //     nameTh: "บัตเตอร์เบียร์ 16oz",
  //     price: 99,
  //     cost: 30, // ต้นทุนประมาณ 30 บาท
  //     categoryId: catDrinks.id,
  //     isActive: true,
  //   },
  // });

  // // โปรโมชั่น
  // const promoSet2 = await prisma.product.upsert({
  //   where: { id: "prod_promo_2" },
  //   update: {},
  //   create: {
  //     id: "prod_promo_2",
  //     name: "Set 2 Cups",
  //     nameTh: "โปรโมชั่น 2 แก้ว",
  //     price: 169, // ปกติ 178 (89*2) ลด 9 บาท
  //     cost: 50,
  //     categoryId: catPromotion.id,
  //     isActive: true,
  //   },
  // });

  // const promoSet3 = await prisma.product.upsert({
  //   where: { id: "prod_promo_3" },
  //   update: {},
  //   create: {
  //     id: "prod_promo_3",
  //     name: "Set 3 Cups",
  //     nameTh: "โปรโมชั่น 3 แก้ว",
  //     price: 249, // ปกติ 267 (89*3) ลด 18 บาท
  //     cost: 75,
  //     categoryId: catPromotion.id,
  //     isActive: true,
  //   },
  // });

  // const promoFamily = await prisma.product.upsert({
  //   where: { id: "prod_promo_family" },
  //   update: {},
  //   create: {
  //     id: "prod_promo_family",
  //     name: "Family Set (5 Cups)",
  //     nameTh: "เซ็ทครอบครัว 5 แก้ว",
  //     price: 399, // ปกติ 445 (89*5) ลด 46 บาท
  //     cost: 125,
  //     categoryId: catPromotion.id,
  //     isActive: true,
  //   },
  // });

  // console.log("   ✅ สร้างสินค้า 5 รายการ");

  // // =============================================
  // // สร้างสูตร (Recipes) - เชื่อมสินค้ากับวัตถุดิบ
  // // =============================================
  // console.log("\n📋 สร้างสูตรการผลิต (Recipe)...");

  // // สูตร Butter Beer 14oz
  // await Promise.all([
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_soda",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_soda",
  //       amountUsed: 0.15,
  //     }, // 0.15 ขวด (≈225ml)
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_butterscotch",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_butterscotch",
  //       amountUsed: 0.04,
  //     }, // 0.04 ขวด (≈30ml)
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_cream",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_cream",
  //       amountUsed: 0.1,
  //     }, // 0.1 กระป๋อง
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_cup_14oz",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_cup_14oz",
  //       amountUsed: 1,
  //     }, // 1 ใบ
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_lid",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_lid",
  //       amountUsed: 1,
  //     }, // 1 ใบ
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_straw",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_straw",
  //       amountUsed: 1,
  //     }, // 1 อัน
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_14oz",
  //         ingredientId: "ing_ice",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_14oz",
  //       ingredientId: "ing_ice",
  //       amountUsed: 0.05,
  //     }, // 0.05 ถุง (≈150g)
  //   }),
  // ]);

  // // สูตร Butter Beer 16oz (ใช้มากกว่า 14oz เล็กน้อย)
  // await Promise.all([
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_soda",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_soda",
  //       amountUsed: 0.2,
  //     }, // 0.2 ขวด (≈300ml)
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_butterscotch",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_butterscotch",
  //       amountUsed: 0.05,
  //     }, // 0.05 ขวด (≈37ml)
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_cream",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_cream",
  //       amountUsed: 0.12,
  //     }, // 0.12 กระป๋อง
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_cup_16oz",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_cup_16oz",
  //       amountUsed: 1,
  //     }, // 1 ใบ
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_lid",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_lid",
  //       amountUsed: 1,
  //     }, // 1 ใบ
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_straw",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_straw",
  //       amountUsed: 1,
  //     }, // 1 อัน
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_bb_16oz",
  //         ingredientId: "ing_ice",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_bb_16oz",
  //       ingredientId: "ing_ice",
  //       amountUsed: 0.07,
  //     }, // 0.07 ถุง (≈210g)
  //   }),
  // ]);

  // // สูตรโปรโมชั่น 2 แก้ว (ใช้เท่า 14oz x 2)
  // await Promise.all([
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_soda",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_soda",
  //       amountUsed: 0.3,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_butterscotch",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_butterscotch",
  //       amountUsed: 0.08,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_cream",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_cream",
  //       amountUsed: 0.2,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_cup_14oz",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_cup_14oz",
  //       amountUsed: 2,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_lid",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_lid",
  //       amountUsed: 2,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_straw",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_straw",
  //       amountUsed: 2,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_2",
  //         ingredientId: "ing_ice",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_2",
  //       ingredientId: "ing_ice",
  //       amountUsed: 0.1,
  //     },
  //   }),
  // ]);

  // // สูตรโปรโมชั่น 3 แก้ว
  // await Promise.all([
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_soda",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_soda",
  //       amountUsed: 0.45,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_butterscotch",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_butterscotch",
  //       amountUsed: 0.12,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_cream",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_cream",
  //       amountUsed: 0.3,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_cup_14oz",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_cup_14oz",
  //       amountUsed: 3,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_lid",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_lid",
  //       amountUsed: 3,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_straw",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_straw",
  //       amountUsed: 3,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_3",
  //         ingredientId: "ing_ice",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_3",
  //       ingredientId: "ing_ice",
  //       amountUsed: 0.15,
  //     },
  //   }),
  // ]);

  // // สูตรโปรโมชั่น 5 แก้ว (Family)
  // await Promise.all([
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_soda",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_soda",
  //       amountUsed: 0.75,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_butterscotch",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_butterscotch",
  //       amountUsed: 0.2,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_cream",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_cream",
  //       amountUsed: 0.5,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_cup_14oz",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_cup_14oz",
  //       amountUsed: 5,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_lid",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_lid",
  //       amountUsed: 5,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_straw",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_straw",
  //       amountUsed: 5,
  //     },
  //   }),
  //   prisma.recipeItem.upsert({
  //     where: {
  //       productId_ingredientId: {
  //         productId: "prod_promo_family",
  //         ingredientId: "ing_ice",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       productId: "prod_promo_family",
  //       ingredientId: "ing_ice",
  //       amountUsed: 0.25,
  //     },
  //   }),
  // ]);

  // console.log("   ✅ สร้างสูตรการผลิตทั้งหมด");

  // =============================================
  // สร้าง Toppings (ตัวเลือกเพิ่มเติม)
  // =============================================
  // console.log("\n🧁 สร้าง Toppings...");

  // const toppings = await Promise.all([
  //   prisma.topping.upsert({
  //     where: { id: "top_whip_extra" },
  //     update: {},
  //     create: {
  //       id: "top_whip_extra",
  //       name: "Extra Whip Cream",
  //       nameTh: "วิปครีมเพิ่ม",
  //       price: 10,
  //     },
  //   }),
  //   prisma.topping.upsert({
  //     where: { id: "top_butterscotch" },
  //     update: {},
  //     create: {
  //       id: "top_butterscotch",
  //       name: "Extra Butterscotch",
  //       nameTh: "ไซรัปเพิ่ม",
  //       price: 10,
  //     },
  //   }),
  //   prisma.topping.upsert({
  //     where: { id: "top_ice_extra" },
  //     update: {},
  //     create: {
  //       id: "top_ice_extra",
  //       name: "Extra Ice",
  //       nameTh: "น้ำแข็งเพิ่ม",
  //       price: 0, // ฟรี
  //     },
  //   }),
  //   prisma.topping.upsert({
  //     where: { id: "top_sticker" },
  //     update: {},
  //     create: {
  //       id: "top_sticker",
  //       name: "Brand Sticker",
  //       nameTh: "สติ๊กเกอร์แบรนด์",
  //       price: 5,
  //     },
  //   }),
  // ]);

  // console.log(`   ✅ สร้าง Toppings ${toppings.length} รายการ`);

  // =============================================
  // สร้าง Admin/Staff Users
  // =============================================
  console.log("\n👤 สร้าง Users...");

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

  const staffUser2 = await prisma.user.upsert({
    where: { email: "myfrekt@gmail.com" },
    update: {},
    create: {
      email: "myfrekt@gmail.com",
      name: "Jack Staff",
      role: "STAFF",
    },
  });


  console.log(`   ✅ Admin: ${adminUser.email}`);
  console.log(`   ✅ Admin: ${adminUser2.email}`);
  console.log(`   ✅ Staff: ${staffUser.email}`);

  // =============================================
  // สรุปต้นทุนและกำไร
  // =============================================
  // console.log("\n📊 สรุปต้นทุนและกำไร:");
  // console.log("─".repeat(60));

  // const products = await prisma.product.findMany({
  //   include: { category: true },
  //   orderBy: { categoryId: "asc" },
  // });

  // for (const product of products) {
  //   const cost = product.cost ?? 0;
  //   const profit = product.price - cost;
  //   const margin =
  //     product.price > 0 ? ((profit / product.price) * 100).toFixed(0) : 0;
  //   const cat = product.category?.name ?? "ไม่มีหมวด";

  //   console.log(
  //     `   [${cat}] ${product.nameTh}: ราคา ${product.price}฿ | ต้นทุน ${cost}฿ | กำไร ${profit}฿ (${margin}%)`,
  //   );
  // }

  console.log("─".repeat(60));
  console.log("\n🎉 Seed สำเร็จ! Butter Beer Shop พร้อมใช้งาน 🍺\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
