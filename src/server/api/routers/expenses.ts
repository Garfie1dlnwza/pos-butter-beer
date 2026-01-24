import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// หมวดหมู่รายจ่าย
export const EXPENSE_CATEGORIES = [
  { id: "rent", label: "ค่าเช่า", labelEn: "Rent" },
  { id: "utilities", label: "ค่าน้ำ/ไฟ", labelEn: "Utilities" },
  { id: "labor", label: "ค่าแรง", labelEn: "Labor" },
  { id: "marketing", label: "การตลาด", labelEn: "Marketing" },
  { id: "equipment", label: "อุปกรณ์", labelEn: "Equipment" },
  { id: "supplies", label: "วัสดุสิ้นเปลือง", labelEn: "Supplies" },
  { id: "experiment", label: "ทดลองสูตร", labelEn: "R&D" },
  { id: "other", label: "อื่นๆ", labelEn: "Other" },
] as const;

export const expensesRouter = createTRPCRouter({
  // ดึงรายจ่ายทั้งหมด (กรองตามช่วงวันที่)
  getAll: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, category } = input;

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
          ...(category && category !== "all" ? { category } : {}),
        },
        orderBy: { date: "desc" },
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
        },
      });
    }),

  // ดึงสรุปรายจ่ายตามหมวด (สำหรับ Dashboard)
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

      // Group by category
      const byCategory: Record<string, number> = {};
      let total = 0;

      for (const expense of expenses) {
        byCategory[expense.category] =
          (byCategory[expense.category] ?? 0) + expense.amount;
        total += expense.amount;
      }

      return { byCategory, total };
    }),

  // สร้างรายจ่ายใหม่
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        amount: z.number().positive(),
        category: z.string(),
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
          category: input.category,
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
        category: z.string().optional(),
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
