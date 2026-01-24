"use client";

import { api } from "@/trpc/react";
import { DateRangePicker } from "./_components/DateRangePicker";
import { SalesChart } from "./_components/SalesChart";
import { ExportButton } from "./_components/ExportButton";
import { useSearchParams } from "next/navigation";

export default function ReportsPage() {
  const searchParams = useSearchParams();

  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const startDate = startDateParam ? new Date(startDateParam) : thirtyDaysAgo;
  const endDate = endDateParam ? new Date(endDateParam) : today;

  const { data: dailySales, isLoading } = api.reports.getDailySales.useQuery({
    startDate,
    endDate,
  });

  const { data: productSales } = api.reports.getProductSales.useQuery({
    startDate,
    endDate,
  });

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
                        .map(
                          (
                            day, // Show latest first table-wise
                          ) => (
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
                          ),
                        )}
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
