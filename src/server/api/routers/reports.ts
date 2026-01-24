import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const reportsRouter = createTRPCRouter({
  getDailySales: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Ensure time range covers the full day
      const start = new Date(input.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      const orders = await ctx.db.order.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
          status: "completed",
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date
      const salesByDate: Record<
        string,
        { date: string; revenue: number; orders: number; cost: number }
      > = {};

      for (const order of orders) {
        const dateKey = order.createdAt.toISOString().split("T")[0]!;
        salesByDate[dateKey] ??= {
          date: dateKey,
          revenue: 0,
          orders: 0,
          cost: 0,
        };

        const dayStats = salesByDate[dateKey]!;
        dayStats.revenue += order.totalAmount;
        dayStats.orders += 1;

        // Calculate cost from items
        // Note: For now we iterate items. Ideally we should include items in query.
        // But let's fetch items separately or include them?
        // Including items in a large date range query might be heavy.
        // Let's optimize: include items in the main query.
      }

      // Re-query with include items to get accurate cost
      const ordersWithItems = await ctx.db.order.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
          status: "completed",
        },
        include: {
          items: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const refinedSalesByDate: Record<
        string,
        { date: string; revenue: number; orders: number; cost: number }
      > = {};

      for (const order of ordersWithItems) {
        const dateKey = order.createdAt.toISOString().split("T")[0]!;
        refinedSalesByDate[dateKey] ??= {
          date: dateKey,
          revenue: 0,
          orders: 0,
          cost: 0,
        };

        const dayStats = refinedSalesByDate[dateKey]!;
        dayStats.revenue += order.totalAmount;
        dayStats.orders += 1;

        let orderCost = 0;
        for (const item of order.items) {
          orderCost += item.cost;
        }
        dayStats.cost += orderCost;
      }

      // Fill missing dates with 0?
      // User might want to see 0 sales days.
      // Let's generate date range.
      const result = [];
      const current = new Date(start);
      while (current <= end) {
        const dateKey = current.toISOString().split("T")[0]!;
        result.push(
          refinedSalesByDate[dateKey] ?? {
            date: dateKey,
            revenue: 0,
            orders: 0,
            cost: 0,
            profit: 0,
            margin: 0,
          },
        );
        current.setDate(current.getDate() + 1);
      }

      // Add profit/margin calculation
      return result.map((d) => ({
        ...d,
        profit: d.revenue - d.cost,
        margin: d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0,
      }));
    }),

  getProductSales: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const start = new Date(input.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      const orderItems = await ctx.db.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: start, lte: end },
            status: "completed",
          },
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      });

      const productStats: Record<
        string,
        {
          id: string;
          name: string;
          category: string;
          quantity: number;
          revenue: number;
          cost: number;
        }
      > = {};

      for (const item of orderItems) {
        productStats[item.productId] ??= {
          id: item.productId,
          name: item.product.nameTh || item.product.name,
          category: item.product.category?.name ?? "Uncategorized",
          quantity: 0,
          revenue: 0,
          cost: 0,
        };

        const stats = productStats[item.productId]!;
        stats.quantity += item.quantity;
        stats.revenue += item.unitPrice * item.quantity;
        stats.cost += item.cost;
      }

      return Object.values(productStats)
        .map((p) => ({
          ...p,
          profit: p.revenue - p.cost,
          margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }),
});
