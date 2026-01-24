import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const shiftsRouter = createTRPCRouter({
  // Get current open shift for user
  getCurrentShift: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.shift.findFirst({
      where: {
        userId: ctx.session.user.id,
        status: "open",
      },
      include: {
        orders: {
          select: {
            id: true,
            netAmount: true,
            paymentMethod: true,
          },
        },
      },
    });
  }),

  // Get all shifts
  getAll: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        userId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // If STAFF, allows seeing their own shifts or all?
      // For now, allowing access. Can enforce userId check later if needed.

      return ctx.db.shift.findMany({
        where: {
          ...(input.userId ? { userId: input.userId } : {}),
          ...(input.startDate && input.endDate
            ? {
                startedAt: {
                  gte: input.startDate,
                  lte: input.endDate,
                },
              }
            : {}),
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
          _count: {
            select: { orders: true },
          },
          orders: {
            select: {
              netAmount: true,
              paymentMethod: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: input.limit,
      });
    }),

  // Open a new shift
  openShift: protectedProcedure
    .input(
      z.object({
        openingCash: z.number().min(0),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has an open shift
      const existingShift = await ctx.db.shift.findFirst({
        where: {
          userId: ctx.session.user.id,
          status: "open",
        },
      });

      if (existingShift) {
        throw new Error("คุณมีกะที่เปิดอยู่แล้ว กรุณาปิดกะก่อน");
      }

      return ctx.db.shift.create({
        data: {
          userId: ctx.session.user.id,
          openingCash: input.openingCash,
          note: input.note,
        },
      });
    }),

  // Close current shift
  closeShift: protectedProcedure
    .input(
      z.object({
        shiftId: z.string(),
        closingCash: z.number().min(0),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get shift with orders
      const shift = await ctx.db.shift.findUnique({
        where: { id: input.shiftId },
        include: {
          orders: {
            where: {
              status: "completed",
            },
            select: {
              netAmount: true,
              paymentMethod: true,
            },
          },
        },
      });

      if (!shift) {
        throw new Error("ไม่พบกะที่ต้องการปิด");
      }

      if (
        shift.userId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("ไม่มีสิทธิ์ปิดกะนี้");
      }

      if (shift.status !== "open") {
        throw new Error("กะนี้ถูกปิดไปแล้ว");
      }

      // Calculate expected cash (opening + cash sales)
      const cashSales = shift.orders
        .filter((o) => o.paymentMethod === "cash")
        .reduce((sum, o) => sum + o.netAmount, 0);

      const expectedCash = shift.openingCash + cashSales;
      const cashVariance = input.closingCash - expectedCash;

      return ctx.db.shift.update({
        where: { id: input.shiftId },
        data: {
          endedAt: new Date(),
          closingCash: input.closingCash,
          expectedCash,
          cashVariance,
          status: "closed",
          note: input.note,
        },
      });
    }),

  // Get shift summary
  getShiftSummary: protectedProcedure
    .input(z.object({ shiftId: z.string() }))
    .query(async ({ ctx, input }) => {
      const shift = await ctx.db.shift.findUnique({
        where: { id: input.shiftId },
        include: {
          user: {
            select: { name: true, email: true },
          },
          orders: {
            where: { status: "completed" },
            select: {
              id: true,
              netAmount: true,
              paymentMethod: true,
            },
          },
        },
      });

      if (!shift) {
        throw new Error("ไม่พบกะ");
      }

      // Calculate summaries
      const totalSales = shift.orders.reduce((sum, o) => sum + o.netAmount, 0);
      const cashSales = shift.orders
        .filter((o) => o.paymentMethod === "cash")
        .reduce((sum, o) => sum + o.netAmount, 0);
      const qrSales = shift.orders
        .filter((o) => o.paymentMethod === "qr")
        .reduce((sum, o) => sum + o.netAmount, 0);
      const otherSales = totalSales - cashSales - qrSales;

      return {
        shift,
        summary: {
          totalOrders: shift.orders.length,
          totalSales,
          cashSales,
          qrSales,
          otherSales,
          expectedCash: shift.openingCash + cashSales,
        },
      };
    }),
});
