"use client";

import { api } from "@/trpc/react";

export function SummaryCards() {
  const {
    data: summary,
    isLoading,
    error,
  } = api.dashboard.getTodaySummary.useQuery();

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        Error loading dashboard data: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-gray-200"
          ></div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      label: "ยอดขายวันนี้",
      value: `฿${summary.revenue.toLocaleString()}`,
      subValue: `${summary.orderCount} ออเดอร์`,
      color: "bg-[#EFEBE9] text-[#3E2723]",
      icon: (
        <svg
          className="h-6 w-6 text-[#8D6E63]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "กำไรสุทธิ (Net)",
      value: `฿${(summary.netProfit ?? 0).toLocaleString()}`,
      subValue: `รวมรายรับ/จ่ายอื่นๆ`,
      color:
        (summary.netProfit ?? 0) >= 0
          ? "bg-[#E8F5E9] text-[#1B5E20]"
          : "bg-[#FFEBEE] text-[#B71C1C]",
      icon: (
        <svg
          className={`h-6 w-6 ${(summary.netProfit ?? 0) >= 0 ? "text-[#43A047]" : "text-[#E53935]"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "รายรับอื่นๆ",
      value: `฿${(summary.incomes ?? 0).toLocaleString()}`,
      subValue: "Other Income",
      color: "bg-[#E3F2FD] text-[#0D47A1]",
      icon: (
        <svg
          className="h-6 w-6 text-[#1E88E5]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      label: "ค่าใช้จ่าย (OPEX)",
      value: `฿${(summary.expenses ?? 0).toLocaleString()}`,
      subValue: "Operating Expenses",
      color: "bg-[#FFEBEE] text-[#B71C1C]",
      icon: (
        <svg
          className="h-6 w-6 text-[#E53935]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`flex flex-col justify-between rounded-2xl p-6 shadow-sm transition hover:shadow-md ${card.color}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <h3 className="mt-1 text-2xl font-bold">{card.value}</h3>
            </div>
            <div className="rounded-full bg-white/50 p-2">{card.icon}</div>
          </div>
          <p className="mt-4 text-xs font-medium opacity-70">{card.subValue}</p>
        </div>
      ))}
      <div className="col-span-full mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4 font-mono text-xs text-yellow-800">
        <p className="font-bold">Debug Info (Please verify):</p>
        <pre>{JSON.stringify(summary.debug, null, 2)}</pre>
        <p className="mt-2">Net Profit Raw: {summary.netProfit}</p>
        <p>Incomes Raw: {summary.incomes}</p>
      </div>
    </div>
  );
}
