import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const ordersRouter = createTRPCRouter({
  // Create new order with stock deduction
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
            unitPrice: z.number(),
            sweetness: z.number().int().min(0).max(100).default(100),
            toppings: z.array(z.string()).default([]),
            toppingCost: z.number().default(0),
          }),
        ),
        paymentMethod: z.enum(["cash", "qr", "card", "grab", "lineman"]),
        totalAmount: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate order number (YYYYMMDD-XXXX)
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const count = await ctx.db.order.count({
        where: {
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
          },
        },
      });
      const orderNumber = `${dateStr}-${String(count + 1).padStart(4, "0")}`;

      // Create order with items
      const order = await ctx.db.order.create({
        data: {
          orderNumber,
          totalAmount: input.totalAmount,
          paymentMethod: input.paymentMethod,
          createdById: ctx.session.user.id,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              sweetness: item.sweetness,
              toppings: item.toppings,
              toppingCost: item.toppingCost,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Deduct stock for each item
      for (const item of input.items) {
        const recipes = await ctx.db.recipeItem.findMany({
          where: { productId: item.productId },
        });

        for (const recipe of recipes) {
          await ctx.db.ingredient.update({
            where: { id: recipe.ingredientId },
            data: {
              currentStock: {
                decrement: recipe.amountUsed * item.quantity,
              },
            },
          });
        }
      }

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "CREATE_ORDER",
          entityId: order.id,
          details: JSON.stringify({
            orderNumber,
            totalAmount: input.totalAmount,
            itemCount: input.items.length,
          }),
        },
      });

      return order;
    }),

  // Get today's orders
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return ctx.db.order.findMany({
      where: {
        createdAt: { gte: today },
        status: "completed",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Void order (ADMIN only)
  void: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const order = await ctx.db.order.update({
        where: { id: input.id },
        data: { status: "cancelled" },
        include: { items: true },
      });

      // Restore stock
      for (const item of order.items) {
        const recipes = await ctx.db.recipeItem.findMany({
          where: { productId: item.productId },
        });

        for (const recipe of recipes) {
          await ctx.db.ingredient.update({
            where: { id: recipe.ingredientId },
            data: {
              currentStock: {
                increment: recipe.amountUsed * item.quantity,
              },
            },
          });
        }
      }

      // Audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "VOID_ORDER",
          entityId: order.id,
          details: JSON.stringify({ reason: input.reason }),
        },
      });

      return order;
    }),
});
