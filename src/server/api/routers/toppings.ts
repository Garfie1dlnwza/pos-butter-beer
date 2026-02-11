import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const toppingsRouter = createTRPCRouter({
  // Get all active toppings with recipes
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.topping.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        recipe: {
          include: { ingredient: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get all toppings for admin (including inactive, but not deleted)
  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
    return ctx.db.topping.findMany({
      where: { deletedAt: null },
      include: {
        recipe: {
          include: { ingredient: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get single topping by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.topping.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          recipe: {
            include: { ingredient: true },
          },
        },
      });
    }),

  // Create topping (ADMIN only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameTh: z.string().optional(),
        price: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.topping.create({
        data: input,
      });
    }),

  // Update topping (ADMIN only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameTh: z.string().optional(),
        price: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const { id, ...data } = input;
      return ctx.db.topping.update({
        where: { id },
        data,
      });
    }),

  // Soft Delete Topping (ADMIN only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      // Soft delete: set deletedAt
      // Also potentially deactivate? Optional but good practice.
      return ctx.db.topping.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
    }),

  // Update topping recipe (ADMIN only)
  updateRecipe: protectedProcedure
    .input(
      z.object({
        toppingId: z.string(),
        recipe: z.array(
          z.object({
            ingredientId: z.string(),
            amountUsed: z.number().min(0),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Delete all existing recipe items for this topping
      await ctx.db.toppingRecipe.deleteMany({
        where: { toppingId: input.toppingId },
      });

      // Create new recipe items (only non-zero amounts)
      const recipeItems = input.recipe.filter((r) => r.amountUsed > 0);

      if (recipeItems.length > 0) {
        await ctx.db.toppingRecipe.createMany({
          data: recipeItems.map((r) => ({
            toppingId: input.toppingId,
            ingredientId: r.ingredientId,
            amountUsed: r.amountUsed,
          })),
        });
      }

      return ctx.db.topping.findUnique({
        where: { id: input.toppingId },
        include: {
          recipe: {
            include: { ingredient: true },
          },
        },
      });
    }),
});
