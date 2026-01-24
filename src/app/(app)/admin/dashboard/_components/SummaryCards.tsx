"use client";

import { api } from "@/trpc/react";

export function SummaryCards() {
  const { data: summary, isLoading } = api.dashboard.getTodaySummary.useQuery();

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
      label: "กำไรขั้นต้น",
      value: `฿${summary.profit.toLocaleString()}`,
      subValue: `Margin ${summary.margin.toFixed(1)}%`,
      color: "bg-[#E8F5E9] text-[#1B5E20]",
      icon: (
        <svg
          className="h-6 w-6 text-[#43A047]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      label: "ต้นทุนสินค้า",
      value: `฿${summary.cost.toLocaleString()}`,
      subValue: "Cost of Goods Sold",
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      label: "จำนวนแก้ว",
      value: `${summary.cupsSold}`,
      subValue: "Sold Items",
      color: "bg-[#FFF3E0] text-[#E65100]",
      icon: (
        <svg
          className="h-6 w-6 text-[#FB8C00]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
    </div>
  );
}
