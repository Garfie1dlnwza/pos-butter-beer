import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const categoriesRouter = createTRPCRouter({
  // Get all active categories
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }),

  // Get all categories for admin (including inactive)
  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
    return ctx.db.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }),

  // Create category (ADMIN only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().optional(),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.category.create({
        data: input,
      });
    }),

  // Update category (ADMIN only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        color: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const { id, ...data } = input;
      return ctx.db.category.update({
        where: { id },
        data,
      });
    }),

  // Soft delete category (ADMIN only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.category.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),
});
