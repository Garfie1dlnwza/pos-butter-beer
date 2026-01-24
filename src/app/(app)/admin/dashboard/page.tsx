"use client";

import { SummaryCards } from "./_components/SummaryCards";
import { SalesChart } from "./_components/SalesChart";
import { TopProducts } from "./_components/TopProducts";

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
            ภาพรวมร้าน
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            ข้อมูลสรุปยอดขายวันนี้และสถิติที่สำคัญ
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="space-y-6 lg:space-y-8">
          {/* Summary Cards */}
          <SummaryCards />

          {/* Charts & Tables */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <TopProducts />
            </div>
            <div>
              <SalesChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
