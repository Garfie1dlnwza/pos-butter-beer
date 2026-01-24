import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  // Get today's summary
  getTodaySummary: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await ctx.db.order.findMany({
      where: {
        createdAt: { gte: today },
        status: "completed",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                recipe: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalCups = 0;

    for (const order of orders) {
      totalRevenue += order.totalAmount;

      for (const item of order.items) {
        totalCups += item.quantity;

        // Calculate cost from recipe
        for (const recipe of item.product.recipe) {
          totalCost +=
            recipe.amountUsed * recipe.ingredient.costPerUnit * item.quantity;
        }
      }
    }

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalRevenue - totalCost,
      margin:
        totalRevenue > 0
          ? ((totalRevenue - totalCost) / totalRevenue) * 100
          : 0,
      orderCount: orders.length,
      cupsSold: totalCups,
    };
  }),

  // Get sales by payment method
  getSalesByChannel: protectedProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orders = await ctx.db.order.findMany({
        where: {
          createdAt: { gte: input?.startDate ?? today },
          status: "completed",
        },
        select: {
          paymentMethod: true,
          totalAmount: true,
        },
      });

      const byChannel: Record<string, { count: number; amount: number }> = {};

      for (const order of orders) {
        byChannel[order.paymentMethod] ??= { count: 0, amount: 0 };
        byChannel[order.paymentMethod]!.count += 1;
        byChannel[order.paymentMethod]!.amount += order.totalAmount;
      }

      return byChannel;
    }),

  // Get best sellers
  getBestSellers: protectedProcedure
    .input(
      z.object({ limit: z.number().int().positive().default(5) }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const today = new Date();
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000,
      );

      const items = await ctx.db.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: thirtyDaysAgo },
            status: "completed",
          },
        },
        include: {
          product: {
            include: {
              recipe: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      });

      const productStats: Record<
        string,
        {
          product: (typeof items)[0]["product"];
          quantity: number;
          revenue: number;
          cost: number;
        }
      > = {};

      for (const item of items) {
        productStats[item.productId] ??= {
          product: item.product,
          quantity: 0,
          revenue: 0,
          cost: 0,
        };

        const stats = productStats[item.productId]!;
        stats.quantity += item.quantity;
        stats.revenue += item.unitPrice * item.quantity;

        for (const recipe of item.product.recipe) {
          stats.cost +=
            recipe.amountUsed * recipe.ingredient.costPerUnit * item.quantity;
        }
      }

      return Object.values(productStats)
        .map((s) => ({
          ...s,
          profit: s.revenue - s.cost,
          margin: s.revenue > 0 ? ((s.revenue - s.cost) / s.revenue) * 100 : 0,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, input?.limit ?? 5);
    }),

  // Get low stock alerts
  getLowStock: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.ingredient.findMany({
      where: {
        currentStock: {
          lte: ctx.db.ingredient.fields.minStock,
        },
      },
      orderBy: { currentStock: "asc" },
    });
  }),
});
