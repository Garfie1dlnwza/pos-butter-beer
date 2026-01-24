"use client";

import { api } from "@/trpc/react";
import { DateRangePicker } from "./_components/DateRangePicker";
import { SalesChart } from "./_components/SalesChart";
import { ExportButton } from "./_components/ExportButton";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ReportsPage() {
  const searchParams = useSearchParams();

  // Default to today (Memoized to prevent infinite re-fetching)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const startDate = startDateParam ? new Date(startDateParam) : today;
  const endDate = endDateParam ? new Date(endDateParam) : today;

  // Set end of day for endDate (for expenses query)
  const endDateEnd = useMemo(() => {
    const d = new Date(endDate);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endDate]);

  const { data: dailySales, isLoading } = api.reports.getDailySales.useQuery({
    startDate,
    endDate,
  });

  const { data: productSales } = api.reports.getProductSales.useQuery({
    startDate,
    endDate,
  });

  // Fetch expenses for the same period
  const { data: expensesSummary } = api.expenses.getSummary.useQuery({
    startDate,
    endDate: endDateEnd,
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!dailySales) return { revenue: 0, cost: 0, grossProfit: 0 };

    const revenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);
    const cost = dailySales.reduce((sum, d) => sum + d.cost, 0);
    const grossProfit = revenue - cost;

    return { revenue, cost, grossProfit };
  }, [dailySales]);

  const opex = expensesSummary?.total ?? 0;
  const netProfit = totals.grossProfit - opex;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-[#D7CCC8]/30 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
            รายงานยอดขาย
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            วิเคราะห์แนวโน้มและสรุปข้อมูลการขาย
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          {dailySales && (
            <ExportButton
              data={dailySales}
              filename={`sales-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}`}
              label="CSV Export"
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {isLoading ? (
          <div className="flex h-64 w-full flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
            <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
              Loading Data
            </span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profit Summary Cards */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Revenue */}
              <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#8D6E63]">รายได้รวม</p>
                <p className="mt-2 text-2xl font-bold text-[#3E2723]">
                  ฿{totals.revenue.toLocaleString()}
                </p>
              </div>

              {/* COGS */}
              <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#8D6E63]">
                  ต้นทุนวัตถุดิบ
                </p>
                <p className="mt-2 text-2xl font-bold text-orange-600">
                  -฿{totals.cost.toLocaleString()}
                </p>
              </div>

              {/* Gross Profit */}
              <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#8D6E63]">
                  กำไรขั้นต้น
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  ฿{totals.grossProfit.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Margin:{" "}
                  {totals.revenue > 0
                    ? ((totals.grossProfit / totals.revenue) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>

              {/* Operating Expenses */}
              <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#8D6E63]">
                  ค่าใช้จ่ายอื่น
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  -฿{opex.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">OPEX</p>
              </div>

              {/* Net Profit */}
              <div
                className={`rounded-xl border-2 p-5 shadow-sm ${netProfit >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <p className="text-sm font-medium text-[#8D6E63]">กำไรสุทธิ</p>
                <p
                  className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ฿{netProfit.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Net Margin:{" "}
                  {totals.revenue > 0
                    ? ((netProfit / totals.revenue) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </section>

            {/* Chart Section */}
            <section>
              <SalesChart data={dailySales ?? []} />
            </section>

            {/* Detailed Tables Grid */}
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Daily Table */}
              <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-[#3E2723]">
                  สรุปรายวัน
                </h3>
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white text-[#8D6E63]">
                      <tr className="border-b border-[#F5F5F5]">
                        <th className="pb-3 font-bold">วันที่</th>
                        <th className="pb-3 text-right font-bold">จำนวน</th>
                        <th className="pb-3 text-right font-bold">ยอดขาย</th>
                        <th className="pb-3 text-right font-bold text-green-600">
                          กำไร
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5] text-[#5D4037]">
                      {dailySales
                        ?.slice()
                        .reverse()
                        .map((day) => (
                          <tr
                            key={day.date}
                            className="group hover:bg-[#FAFAFA]"
                          >
                            <td className="py-3 font-medium">
                              {new Date(day.date).toLocaleDateString("th-TH")}
                            </td>
                            <td className="py-3 text-right">{day.orders}</td>
                            <td className="py-3 text-right font-bold">
                              ฿{day.revenue.toLocaleString()}
                            </td>
                            <td className="py-3 text-right text-green-600">
                              ฿{day.profit.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#3E2723]">
                    สินค้าขายดี (ช่วงเวลานี้)
                  </h3>
                  {productSales && (
                    <ExportButton
                      data={productSales}
                      filename={`products-${startDate.toISOString().split("T")[0]}`}
                      label="CSV"
                    />
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white text-[#8D6E63]">
                      <tr className="border-b border-[#F5F5F5]">
                        <th className="pb-3 font-bold">สินค้า</th>
                        <th className="pb-3 text-right font-bold">จำนวน</th>
                        <th className="pb-3 text-right font-bold">ยอดขาย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5] text-[#5D4037]">
                      {productSales?.map((product, index) => (
                        <tr key={product.id} className="hover:bg-[#FAFAFA]">
                          <td className="py-3">
                            <span className="mr-2 font-bold text-[#3E2723]">
                              #{index + 1}
                            </span>
                            {product.name}
                          </td>
                          <td className="py-3 text-right">
                            {product.quantity}
                          </td>
                          <td className="py-3 text-right font-bold">
                            ฿{product.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
