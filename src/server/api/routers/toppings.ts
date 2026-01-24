import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const toppingsRouter = createTRPCRouter({
  // Get all active toppings
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.topping.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
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
});
