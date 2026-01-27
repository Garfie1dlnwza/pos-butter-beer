import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(), // product id
      quantity: z.number().min(1),
      price: z.number(),
      sweetness: z.number().default(100),
      toppings: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
        }),
      ),
      note: z.string().optional(),
    }),
  ),
  totalAmount: z.number(),
  discount: z.number().default(0),
  netAmount: z.number(),
  receivedAmount: z.number(),
  change: z.number(),
  paymentMethod: z.string(),
  customerName: z.string().optional(),
  note: z.string().optional(),
});

export const ordersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Check for Active Shift (Required for STAFF)
      const currentShift = await ctx.db.shift.findFirst({
        where: {
          userId: ctx.session.user.id,
          status: "open",
        },
      });

      if (!currentShift && ctx.session.user.role === "STAFF") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "กรุณาเปิดกะก่อนทำรายการ",
        });
      }

      if (
        Math.abs(input.totalAmount - input.discount - input.netAmount) > 0.01
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ยอดรวมสุทธิไม่ถูกต้อง (Total - Discount != Net)",
        });
      }

      try {
        return await ctx.db.$transaction(async (tx) => {
          // 2. Fetch Data (Products, Recipes, Toppings)
          const productIds = input.items.map((i) => i.id);
          const products = await tx.product.findMany({
            where: { id: { in: productIds } },
            include: {
              recipe: {
                include: { ingredient: true },
              },
            },
          });
          const productMap = new Map(products.map((p) => [p.id, p]));

          // Validate Products
          for (const item of input.items) {
            if (!productMap.has(item.id)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `ไม่พบสินค้าในระบบ (ID: ${item.id})`,
              });
            }
          }

          // Fetch toppings to get their recipes
          const allToppingIds = input.items.flatMap((i) =>
            i.toppings.map((t) => t.id),
          );
          const toppings = await tx.topping.findMany({
            where: { id: { in: allToppingIds } },
            include: {
              recipe: {
                include: { ingredient: true },
              },
            },
          });
          const toppingMap = new Map(toppings.map((t) => [t.id, t]));

          // 3. Generate Order Number
          const dateStr = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");

          // Find the last order of the day to determine the next sequence number
          const lastOrder = await tx.order.findFirst({
            where: {
              orderNumber: {
                startsWith: `ORD-${dateStr}-`,
              },
            },
            orderBy: {
              orderNumber: "desc",
            },
          });

          let nextSequence = 1;
          if (lastOrder) {
            const parts = lastOrder.orderNumber.split("-");
            const lastSeq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) {
              nextSequence = lastSeq + 1;
            }
          }

          const orderNumber = `ORD-${dateStr}-${String(nextSequence).padStart(4, "0")}`;

          // 4. Create Order & Items
          const order = await tx.order.create({
            data: {
              orderNumber: orderNumber as string, // Assert string as it's generated above
              totalAmount: input.totalAmount,
              discount: input.discount,
              netAmount: input.netAmount,
              paymentMethod: input.paymentMethod,
              status: "completed",
              customerName: input.customerName,
              note: input.note,
              createdById: ctx.session.user.id,
              shiftId: currentShift?.id ?? null, // Link to Shift! (Explicit null)
              items: {
                create: input.items.map((item) => {
                  const product = productMap.get(item.id)!; // Safe because we validated

                  // Calculate Product Cost
                  let productCost = 0;
                  if (product.recipe) {
                    productCost = product.recipe.reduce(
                      (sum, r) => sum + r.amountUsed * r.ingredient.costPerUnit,
                      0,
                    );
                  }

                  // Calculate Topping Cost (from Recipes) for this item
                  // Note: item.toppings has price, but we need cost from recipe
                  const toppingCost = item.toppings.reduce((acc, tItem) => {
                    const topping = toppingMap.get(tItem.id);
                    if (!topping?.recipe) return acc;
                    const cost = topping.recipe.reduce(
                      (rSum, r) =>
                        rSum + r.amountUsed * r.ingredient.costPerUnit,
                      0,
                    );
                    return acc + cost;
                  }, 0);

                  const totalUnitCost = productCost + toppingCost;

                  return {
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    cost: totalUnitCost * item.quantity,
                    sweetness: item.sweetness,
                    toppings: JSON.stringify(item.toppings),
                    toppingCost: item.toppings.reduce(
                      (acc, t) => acc + t.price,
                      0,
                    ),
                    note: item.note,
                  };
                }),
              },
            },
            include: { items: true },
          });

          // 5. Deduct Stock & Create Transactions
          const ingredientsToDeduct = new Map<string, number>();

          // Aggregate total usage per ingredient first
          for (const item of input.items) {
            // Product Ingredients
            const product = productMap.get(item.id);
            if (product?.recipe) {
              for (const r of product.recipe) {
                const current = ingredientsToDeduct.get(r.ingredientId) ?? 0;
                ingredientsToDeduct.set(
                  r.ingredientId,
                  current + r.amountUsed * item.quantity,
                );
              }
            }

            // Topping Ingredients
            for (const tItem of item.toppings) {
              const topping = toppingMap.get(tItem.id);
              if (topping?.recipe) {
                for (const r of topping.recipe) {
                  // Topping usage is 1 per instance per item quantity
                  // item.quantity (cups) * 1 (portion)
                  const current = ingredientsToDeduct.get(r.ingredientId) ?? 0;
                  ingredientsToDeduct.set(
                    r.ingredientId,
                    current + r.amountUsed * item.quantity,
                  );
                }
              }
            }
          }

          // Execute Deductions
          for (const [ingredientId, amount] of ingredientsToDeduct.entries()) {
            // A. Update Current Stock
            await tx.ingredient.update({
              where: { id: ingredientId },
              data: { currentStock: { decrement: amount } },
            });

            // B. Create Inventory Transaction
            await tx.inventoryTransaction.create({
              data: {
                type: "SALE",
                quantity: -amount, // Negative for deduction
                ingredientId: ingredientId,
                note: `Order: ${orderNumber}`,
                createdById: ctx.session.user.id,
              },
            });

            // C. FIFO Lot Deduction (Optional but good)
            let remainingNeeded = amount;
            const stockLots = await tx.stockLot.findMany({
              where: { ingredientId: ingredientId, remainingQty: { gt: 0 } },
              orderBy: { createdAt: "asc" },
            });

            for (const lot of stockLots) {
              if (remainingNeeded <= 0) break;
              const deduct = Math.min(lot.remainingQty, remainingNeeded);
              await tx.stockLot.update({
                where: { id: lot.id },
                data: { remainingQty: { decrement: deduct } },
              });
              remainingNeeded -= deduct;
            }
          }

          return order;
        });
      } catch (error) {
        console.error("Failed to create order:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create order",
        });
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: true,
        items: {
          include: { product: true },
        },
      },
      take: 100,
    });
  }),

  // Cancel Order & Restore Stock
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        // 1. Get Order
        const order = await tx.order.findUnique({
          where: { id: input.id },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    recipe: true,
                  },
                },
              },
            },
          },
        });

        if (!order)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        if (order.status === "cancelled")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order already cancelled",
          });

        // 2. Restore Stock
        for (const item of order.items) {
          for (const recipeItem of item.product.recipe) {
            const amountRestore = recipeItem.amountUsed * item.quantity;

            // Restore to main stock
            await tx.ingredient.update({
              where: { id: recipeItem.ingredientId },
              data: { currentStock: { increment: amountRestore } },
            });

            // Ideally we should restore to specific lots, but for simplicity
            // we can either add to the latest lot or create a "Returns" lot.
            // Here we'll just increment the latest active lot or create one if none.
            // Or simpler: Just update main availability.
            // Note: This leaves StockLot out of sync slightly if we don't restore to a lot.
            // Let's try to restore to the latest lot (LIFO restoration?)

            const latestLot = await tx.stockLot.findFirst({
              where: { ingredientId: recipeItem.ingredientId },
              orderBy: { createdAt: "desc" },
            });

            if (latestLot) {
              await tx.stockLot.update({
                where: { id: latestLot.id },
                data: { remainingQty: { increment: amountRestore } },
              });
            }
          }
        }

        // 3. Update Order Status
        return tx.order.update({
          where: { id: input.id },
          data: { status: "cancelled" },
        });
      });
    }),
});
