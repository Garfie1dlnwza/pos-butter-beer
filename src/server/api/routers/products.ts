import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deleteFile, extractKeyFromUrl } from "@/server/s3";

export const productsRouter = createTRPCRouter({
  // Get all active products with recipes
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        category: true,
        recipe: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get all products for admin (including inactive)
  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }
    return ctx.db.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
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
      return ctx.db.product.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          category: true,
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
        categoryId: z.string().optional(),
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
        categoryId: z.string().nullish(),
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

  // Soft delete product (ADMIN only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Get product to check for image
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
      });

      // Delete image from S3 if exists
      if (product?.image) {
        const key = extractKeyFromUrl(product.image);
        if (key) {
          try {
            await deleteFile(key);
          } catch (e) {
            console.error("Failed to delete image:", e);
          }
        }
      }

      return ctx.db.product.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),

  // Delete image from product (ADMIN only)
  deleteImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
      });

      if (product?.image) {
        const key = extractKeyFromUrl(product.image);
        if (key) {
          await deleteFile(key);
        }
      }

      return ctx.db.product.update({
        where: { id: input.id },
        data: { image: null },
      });
    }),
});
