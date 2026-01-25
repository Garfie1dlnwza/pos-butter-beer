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

      // Fetch Orders, Expenses, Incomes in parallel
      const [ordersWithItems, expenses, incomes] = await Promise.all([
        ctx.db.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            status: "completed",
          },
          include: { items: true },
          orderBy: { createdAt: "asc" },
        }),
        ctx.db.expense.findMany({
          where: { date: { gte: start, lte: end } },
        }),
        ctx.db.income.findMany({
          where: { date: { gte: start, lte: end } },
        }),
      ]);

      const salesByDate: Record<
        string,
        {
          date: string;
          revenue: number;
          orders: number;
          cogs: number; // Cost of Goods Sold
          expenses: number;
          incomes: number;
        }
      > = {};

      // Process Orders
      for (const order of ordersWithItems) {
        const dateKey = order.createdAt.toLocaleDateString("en-CA");
        salesByDate[dateKey] ??= {
          date: dateKey,
          revenue: 0,
          orders: 0,
          cogs: 0,
          expenses: 0,
          incomes: 0,
        };

        const dayStats = salesByDate[dateKey];
        dayStats.revenue += order.totalAmount;
        dayStats.orders += 1;

        let orderCost = 0;
        for (const item of order.items) {
          orderCost += item.cost;
        }
        dayStats.cogs += orderCost;
      }

      // Process Expenses
      for (const expense of expenses) {
        const dateKey = expense.date.toLocaleDateString("en-CA");
        salesByDate[dateKey] ??= {
          date: dateKey,
          revenue: 0,
          orders: 0,
          cogs: 0,
          expenses: 0,
          incomes: 0,
        };
        salesByDate[dateKey].expenses += expense.amount;
      }

      // Process Incomes
      for (const income of incomes) {
        const dateKey = income.date.toLocaleDateString("en-CA");
        salesByDate[dateKey] ??= {
          date: dateKey,
          revenue: 0,
          orders: 0,
          cogs: 0,
          expenses: 0,
          incomes: 0,
        };
        salesByDate[dateKey].incomes += income.amount;
      }

      // Generate result array with zero-filling
      const result: {
        date: string;
        revenue: number;
        orders: number;
        cogs: number; // Renamed from cost for clarity
        expenses: number;
        incomes: number;
        grossProfit: number;
        netProfit: number;
      }[] = [];

      const current = new Date(start);
      while (current <= end) {
        const dateKey = current.toLocaleDateString("en-CA");
        const stats = salesByDate[dateKey] ?? {
          date: dateKey,
          revenue: 0,
          orders: 0,
          cogs: 0,
          expenses: 0,
          incomes: 0,
        };

        const grossProfit = stats.revenue - stats.cogs;
        const netProfit =
          stats.revenue + stats.incomes - (stats.cogs + stats.expenses);

        result.push({
          ...stats,
          grossProfit,
          netProfit,
        });
        current.setDate(current.getDate() + 1);
      }

      // Compute formatting/margin (optional, can be done in UI)
      return result.map((d) => ({
        ...d,
        cost: d.cogs, // Backward compatibility alias
        profit: d.grossProfit, // Backward compatibility alias (Gross)
        margin: d.revenue > 0 ? (d.grossProfit / d.revenue) * 100 : 0,
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
        const name = item.product.nameTh ?? item.product.name;
        const categoryName = item.product.category?.name ?? "Uncategorized";

        productStats[item.productId] ??= {
          id: item.productId,
          name: name,
          category: categoryName,
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
