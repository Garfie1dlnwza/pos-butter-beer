import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const incomesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        amount: z.number().min(0),
        description: z.string().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create new income record
      return ctx.db.income.create({
        data: {
          title: input.title,
          amount: input.amount,
          description: input.description,
          date: input.date ?? new Date(),
          createdById: ctx.session.user.id,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.income.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        createdBy: true,
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        amount: z.number().min(0),
        description: z.string().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.income.update({
        where: { id: input.id },
        data: {
          title: input.title,
          amount: input.amount,
          description: input.description,
          date: input.date,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.income.delete({
        where: { id: input.id },
      });
    }),
});
