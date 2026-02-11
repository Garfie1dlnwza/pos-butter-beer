import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  // Get all users (admin only)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  // Create a new user (whitelist for login)
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email("อีเมลไม่ถูกต้อง"),
        name: z.string().min(1, "กรุณากรอกชื่อ"),
        role: z.enum(["ADMIN", "STAFF"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "อีเมลนี้มีอยู่ในระบบแล้ว",
        });
      }

      return ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
        },
      });
    }),

  // Update user
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        role: z.enum(["ADMIN", "STAFF"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...data } = input;

      return ctx.db.user.update({
        where: { id },
        data,
      });
    }),

  // Delete user
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Prevent deleting yourself
      if (ctx.session.user.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ไม่สามารถลบตัวเองได้",
        });
      }

      // Delete associated accounts and sessions first
      await ctx.db.account.deleteMany({
        where: { userId: input.id },
      });

      await ctx.db.session.deleteMany({
        where: { userId: input.id },
      });

      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
