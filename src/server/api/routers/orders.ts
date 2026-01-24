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
      return await ctx.db.$transaction(async (tx) => {
        // 1. Fetch products and recipes for cost calculation & stock deduction
        const productIds = input.items.map((i) => i.id);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          include: {
            recipe: {
              include: {
                ingredient: true,
              },
            },
          },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        // 2. Generate Order Number (e.g., ORD-20240124-0001)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const todayCount = await tx.order.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        });
        const orderNumber = `ORD-${dateStr}-${String(todayCount + 1).padStart(4, "0")}`;

        // 3. Create Order with Calculated Cost
        const order = await tx.order.create({
          data: {
            orderNumber,
            totalAmount: input.totalAmount,
            discount: input.discount,
            netAmount: input.netAmount,
            paymentMethod: input.paymentMethod,
            status: "completed",
            customerName: input.customerName,
            note: input.note,
            createdById: ctx.session.user.id,
            items: {
              create: input.items.map((item) => {
                const product = productMap.get(item.id);
                // Calculate unit cost from recipe
                let unitCost = 0;
                if (product?.recipe) {
                  unitCost = product.recipe.reduce(
                    (sum, r) => sum + r.amountUsed * r.ingredient.costPerUnit,
                    0,
                  );
                }

                return {
                  productId: item.id,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  cost: unitCost * item.quantity, // Total cost for this line (cost * qty)
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

        // 4. Deduct Stock (FIFO)
        for (const item of input.items) {
          const product = productMap.get(item.id);
          if (!product || !product.recipe) continue;

          for (const recipeItem of product.recipe) {
            const amountNeeded = recipeItem.amountUsed * item.quantity;
            let remainingNeeded = amountNeeded;

            // Update main ingredient stock
            await tx.ingredient.update({
              where: { id: recipeItem.ingredientId },
              data: { currentStock: { decrement: amountNeeded } },
            });

            // Find stock lots (FIFO)
            const stockLots = await tx.stockLot.findMany({
              where: {
                ingredientId: recipeItem.ingredientId,
                remainingQty: { gt: 0 },
              },
              orderBy: { createdAt: "asc" },
            });

            for (const lot of stockLots) {
              if (remainingNeeded <= 0) break;

              const deductAmount = Math.min(lot.remainingQty, remainingNeeded);

              await tx.stockLot.update({
                where: { id: lot.id },
                data: { remainingQty: { decrement: deductAmount } },
              });

              remainingNeeded -= deductAmount;
            }
          }
        }

        return order;
      });
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
