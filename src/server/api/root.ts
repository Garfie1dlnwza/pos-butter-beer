import { postRouter } from "@/server/api/routers/post";
import { productsRouter } from "@/server/api/routers/products";
import { toppingsRouter } from "@/server/api/routers/toppings";
import { ordersRouter } from "@/server/api/routers/orders";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { ingredientsRouter } from "@/server/api/routers/ingredients";
import { categoriesRouter } from "@/server/api/routers/categories";
import { reportsRouter } from "@/server/api/routers/reports";
import { expensesRouter } from "@/server/api/routers/expenses";
import { inventoryRouter } from "@/server/api/routers/inventory";
import { shiftsRouter } from "@/server/api/routers/shifts";
import { authRouter } from "@/server/api/routers/auth";
import { incomesRouter } from "@/server/api/routers/incomes";
import { usersRouter } from "@/server/api/routers/users";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter, // Added auth router
  post: postRouter,
  products: productsRouter,
  toppings: toppingsRouter,
  orders: ordersRouter,
  dashboard: dashboardRouter,
  ingredients: ingredientsRouter,
  categories: categoriesRouter,
  reports: reportsRouter,
  expenses: expensesRouter,
  inventory: inventoryRouter,
  shifts: shiftsRouter,
  incomes: incomesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
