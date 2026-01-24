import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const expensesRouter = createTRPCRouter({
  // ดึงรายจ่ายทั้งหมด (กรองตามช่วงวันที่)
  getAll: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      return ctx.db.expense.findMany({
        where: {
          ...(startDate && endDate
            ? {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              }
            : {}),
        },
        orderBy: { date: "desc" },
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
        },
      });
    }),

  // ดึงสรุปรายจ่ายรวม (สำหรับ Dashboard)
  getSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.expense.findMany({
        where: {
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
      });

      let total = 0;
      for (const expense of expenses) {
        total += expense.amount;
      }

      return { total };
    }),

  // สร้างรายจ่ายใหม่
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        amount: z.number().positive(),
        description: z.string().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      return ctx.db.expense.create({
        data: {
          title: input.title,
          amount: input.amount,
          description: input.description,
          date: input.date ?? new Date(),
          createdById: ctx.session.user.id,
        },
      });
    }),

  // แก้ไขรายจ่าย
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { id, ...data } = input;
      return ctx.db.expense.update({
        where: { id },
        data,
      });
    }),

  // ลบรายจ่าย
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      return ctx.db.expense.delete({
        where: { id: input.id },
      });
    }),
});
