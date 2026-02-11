import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const ingredientsRouter = createTRPCRouter({
  // Get all active ingredients with stock info
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.ingredient.findMany({
      where: { deletedAt: null },
      include: {
        stockLots: {
          where: { remainingQty: { gt: 0 } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get single ingredient by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ingredient.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          usedIn: {
            include: { product: true },
          },
          stockLots: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Create ingredient (ADMIN only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        unit: z.string().min(1),
        costPerUnit: z.number().min(0),
        minStock: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.ingredient.create({
        data: input,
      });
    }),

  // Update ingredient (ADMIN only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        unit: z.string().min(1).optional(),
        costPerUnit: z.number().min(0).optional(),
        minStock: z.number().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const { id, ...data } = input;
      return ctx.db.ingredient.update({
        where: { id },
        data,
      });
    }),

  // Soft delete ingredient (ADMIN only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.ingredient.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),

  // Restore soft-deleted ingredient (ADMIN only)
  restore: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.ingredient.update({
        where: { id: input.id },
        data: { deletedAt: null },
      });
    }),

  // Add stock (create new StockLot)
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

      // Create stock lot and update ingredient's current stock
      const [stockLot] = await ctx.db.$transaction([
        ctx.db.stockLot.create({
          data: {
            ingredientId: input.ingredientId,
            quantity: input.quantity,
            costPerUnit: input.costPerUnit,
            remainingQty: input.quantity,
            note: input.note,
          },
        }),
        ctx.db.ingredient.update({
          where: { id: input.ingredientId },
          data: {
            currentStock: { increment: input.quantity },
            costPerUnit: input.costPerUnit, // Update to latest cost
          },
        }),
      ]);

      return stockLot;
    }),

  // Get low stock ingredients (currentStock <= minStock)
  getLowStock: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.$queryRaw`
      SELECT * FROM "Ingredient"
      WHERE "deletedAt" IS NULL
        AND "currentStock" <= "minStock"
      ORDER BY "currentStock" ASC
    `;
  }),
});
