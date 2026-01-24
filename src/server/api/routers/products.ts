import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const productsRouter = createTRPCRouter({
  // Get all active products with recipes
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { isActive: true },
      include: {
        recipe: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get single product by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          recipe: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    }),

  // Create product (ADMIN only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameTh: z.string().optional(),
        price: z.number().positive(),
        category: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.product.create({
        data: input,
      });
    }),

  // Update product (ADMIN only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameTh: z.string().optional(),
        price: z.number().positive().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      const { id, ...data } = input;
      return ctx.db.product.update({
        where: { id },
        data,
      });
    }),

  // Delete product (ADMIN only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.product.delete({
        where: { id: input.id },
      });
    }),
});
