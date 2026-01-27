"use client";

import { api } from "@/trpc/react";
import { DateRangePicker } from "./_components/DateRangePicker";
import { SalesChart } from "./_components/SalesChart";
import { ExportButton } from "./_components/ExportButton";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ReportsPage() {
  const searchParams = useSearchParams();

  // Default to current month (Memoized to prevent infinite re-fetching)
  const defaultRange = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, []);

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const startDate = useMemo(
    () => (startDateParam ? new Date(startDateParam) : defaultRange.start),
    [startDateParam, defaultRange],
  );
  const endDate = useMemo(
    () => (endDateParam ? new Date(endDateParam) : defaultRange.end),
    [endDateParam, defaultRange],
  );

  // Fetch Daily Sales (now includes expenses & incomes)
  const { data: dailySales, isLoading } = api.reports.getDailySales.useQuery({
    startDate,
    endDate,
  });

  const { data: productSales } = api.reports.getProductSales.useQuery({
    startDate,
    endDate,
  });

  // Calculate totals from dailySales
  const totals = useMemo(() => {
    if (!dailySales)
      return {
        revenue: 0,
        cost: 0,
        grossProfit: 0,
        expenses: 0,
        incomes: 0,
        netProfit: 0,
      };

    const revenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);
    const cost = dailySales.reduce((sum, d) => sum + d.cogs, 0); // cogs
    const expenses = dailySales.reduce((sum, d) => sum + d.expenses, 0);
    const incomes = dailySales.reduce((sum, d) => sum + d.incomes, 0);
    const grossProfit = revenue - cost;
    const netProfit = revenue + incomes - (cost + expenses);

    return { revenue, cost, grossProfit, expenses, incomes, netProfit };
  }, [dailySales]);

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
              data={dailySales.map((d) => ({
                วันที่: new Date(d.date).toLocaleDateString("th-TH"),
                "ยอดขาย (Revenue)": d.revenue,
                "ต้นทุนขาย (COGS)": d.cogs,
                "กำไรขั้นต้น (Gross Profit)": d.grossProfit,
                "รายรับอื่นๆ (Incomes)": d.incomes,
                "เงินทุน (Capital)": d.capital,
                "ค่าใช้จ่ายดำเนินงาน (Expenses)": d.expenses,
                "กำไรสุทธิ (Net Profit)": d.netProfit,
                "ยอดซื้อวัตถุดิบ (Purchases)": d.purchases,
                "กระแสเงินสดสุทธิ (Cash Flow)": d.cashFlow,
              }))}
              filename={`sales-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}`}
              label="Export Excel"
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
                <p className="text-sm font-medium text-[#8D6E63]">
                  ยอดขายทั้งหมด
                </p>
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

              {/* Incomes */}
              <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#8D6E63]">
                  รายรับอื่นๆ
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  +฿{totals.incomes.toLocaleString()}
                </p>
              </div>

              {/* Operating Expenses */}
              <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#8D6E63]">
                  ค่าใช้จ่ายอื่น
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  -฿{totals.expenses.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">OPEX</p>
              </div>

              {/* Net Profit */}
              <div
                className={`rounded-xl border-2 p-5 shadow-sm ${totals.netProfit >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <p className="text-sm font-medium text-[#8D6E63]">กำไรสุทธิ</p>
                <p
                  className={`mt-2 text-2xl font-bold ${totals.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ฿{totals.netProfit.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Net Margin:{" "}
                  {totals.revenue > 0
                    ? ((totals.netProfit / totals.revenue) * 100).toFixed(1)
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
                      data={productSales.map((p) => ({
                        ชื่อสินค้า: p.name,
                        หมวดหมู่: p.category,
                        จำนวนที่ขาย: p.quantity,
                        ยอดขาย: p.revenue,
                        ต้นทุนรวม: p.cost,
                        กำไร: p.profit,
                        "% Margin": `${p.margin.toFixed(2)}%`,
                      }))}
                      filename={`products-${startDate.toISOString().split("T")[0]}`}
                      label="Export Excel"
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
