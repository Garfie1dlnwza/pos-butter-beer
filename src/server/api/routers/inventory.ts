import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const inventoryRouter = createTRPCRouter({
  // Get transactions for an ingredient
  getTransactions: protectedProcedure
    .input(
      z.object({
        ingredientId: z.string().optional(),
        type: z
          .enum(["PURCHASE", "SALE", "ADJUSTMENT", "WASTE", "STOCK_TAKE"])
          .optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inventoryTransaction.findMany({
        where: {
          ...(input.ingredientId ? { ingredientId: input.ingredientId } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...(input.startDate && input.endDate
            ? {
                createdAt: {
                  gte: input.startDate,
                  lte: input.endDate,
                },
              }
            : {}),
        },
        include: {
          ingredient: true,
          createdBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // Add stock (PURCHASE)
  addStock: protectedProcedure
    .input(
      z.object({
        ingredientId: z.string(),
        quantity: z.number().positive(),
        costPerUnit: z.number().min(0),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Create transaction
      const transaction = await ctx.db.inventoryTransaction.create({
        data: {
          ingredientId: input.ingredientId,
          type: "PURCHASE",
          quantity: input.quantity,
          costPerUnit: input.costPerUnit,
          note: input.note,
          createdById: ctx.session.user.id,
        },
      });

      // Create StockLot
      await ctx.db.stockLot.create({
        data: {
          ingredientId: input.ingredientId,
          quantity: input.quantity,
          costPerUnit: input.costPerUnit,
          remainingQty: input.quantity,
          note: input.note,
        },
      });

      // Update currentStock
      await ctx.db.ingredient.update({
        where: { id: input.ingredientId },
        data: {
          currentStock: { increment: input.quantity },
          costPerUnit: input.costPerUnit, // Update to latest cost
        },
      });

      return transaction;
    }),

  // Adjust stock (ADJUSTMENT / WASTE)
  adjustStock: protectedProcedure
    .input(
      z.object({
        ingredientId: z.string(),
        quantity: z.number(), // + or -
        type: z.enum(["ADJUSTMENT", "WASTE"]),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Create transaction
      const transaction = await ctx.db.inventoryTransaction.create({
        data: {
          ingredientId: input.ingredientId,
          type: input.type,
          quantity: input.quantity,
          note: input.note,
          createdById: ctx.session.user.id,
        },
      });

      // Update currentStock
      await ctx.db.ingredient.update({
        where: { id: input.ingredientId },
        data: {
          currentStock: { increment: input.quantity },
        },
      });

      return transaction;
    }),

  // Stock take (set actual count)
  stockTake: protectedProcedure
    .input(
      z.object({
        ingredientId: z.string(),
        actualQuantity: z.number().min(0),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Get current stock
      const ingredient = await ctx.db.ingredient.findUnique({
        where: { id: input.ingredientId },
      });

      if (!ingredient) {
        throw new Error("Ingredient not found");
      }

      const variance = input.actualQuantity - ingredient.currentStock;

      // Create transaction
      const transaction = await ctx.db.inventoryTransaction.create({
        data: {
          ingredientId: input.ingredientId,
          type: "STOCK_TAKE",
          quantity: variance,
          note:
            input.note ??
            `นับสต็อก: ${ingredient.currentStock} → ${input.actualQuantity}`,
          createdById: ctx.session.user.id,
        },
      });

      // Update currentStock to actual
      await ctx.db.ingredient.update({
        where: { id: input.ingredientId },
        data: {
          currentStock: input.actualQuantity,
        },
      });

      return { transaction, variance };
    }),

  // Get stock variance report
  getVarianceReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.db.inventoryTransaction.findMany({
        where: {
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          ingredient: true,
        },
      });

      // Group by ingredient and type
      const report: Record<
        string,
        {
          name: string;
          unit: string;
          purchased: number;
          sold: number;
          adjusted: number;
          waste: number;
          stockTake: number;
        }
      > = {};

      for (const t of transactions) {
        report[t.ingredientId] ??= {
          name: t.ingredient.name,
          unit: t.ingredient.unit,
          purchased: 0,
          sold: 0,
          adjusted: 0,
          waste: 0,
          stockTake: 0,
        };

        const r = report[t.ingredientId];
        if (r) {
          switch (t.type) {
            case "PURCHASE":
              r.purchased += t.quantity;
              break;
            case "SALE":
              r.sold += Math.abs(t.quantity);
              break;
            case "ADJUSTMENT":
              r.adjusted += t.quantity;
              break;
            case "WASTE":
              r.waste += Math.abs(t.quantity);
              break;
            case "STOCK_TAKE":
              r.stockTake += t.quantity;
              break;
          }
        }
      }

      return Object.entries(report).map(([id, data]) => ({
        ingredientId: id,
        ...data,
      }));
    }),
});
