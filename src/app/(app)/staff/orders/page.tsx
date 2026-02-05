import { db } from "@/server/db";
import Link from "next/link";
import OrdersClient from "./_components/OrdersClient";
import { DateRangePicker } from "../../admin/reports/_components/DateRangePicker";

export default async function OrdersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const startDateParam = searchParams.startDate as string | undefined;
  const endDateParam = searchParams.endDate as string | undefined;

  const start = startDateParam ? new Date(startDateParam) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDateParam ? new Date(endDateParam) : new Date();
  end.setHours(23, 59, 59, 999);

  // Fetch Orders
  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      createdBy: true, // Included staff info
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Daily Totals
  const totalSales = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.netAmount, 0);

  const totalCount = orders.length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Header with Navigation */}
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#D7CCC8]/30 bg-[#FAFAFA]/95 px-6 py-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/pos"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D7CCC8] bg-white text-[#5D4037] transition hover:bg-[#F5F5F5] hover:text-[#3E2723]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#3E2723]">ประวัติการขาย</h1>
            <p className="text-xs text-[#8D6E63]">
              {start.toLocaleDateString("th-TH") ===
              end.toLocaleDateString("th-TH")
                ? start.toLocaleDateString("th-TH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : `${start.toLocaleDateString("th-TH")} - ${end.toLocaleDateString("th-TH")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Picker */}
          <DateRangePicker />
        </div>

        {/* Stats Indicators */}
        <div className="hidden gap-4 sm:flex">
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-wider text-[#8D6E63] uppercase">
              ยอดขายวันนี้
            </p>
            <p className="text-xl font-bold text-[#3E2723]">
              ฿{totalSales.toLocaleString()}
            </p>
          </div>
          <div className="h-auto w-px bg-[#D7CCC8]" />
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-wider text-[#8D6E63] uppercase">
              ออเดอร์
            </p>
            <p className="text-xl font-bold text-[#3E2723]">{totalCount}</p>
          </div>
        </div>
      </header>

      <OrdersClient
        initialOrders={orders}
        startDateProp={start.getTime()}
        endDateProp={end.getTime()}
      />
    </div>
  );
}
