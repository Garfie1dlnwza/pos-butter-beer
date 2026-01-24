"use client";

import { api } from "@/trpc/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#8884d8"];

const PAYMENT_LABELS: Record<string, string> = {
  cash: "เงินสด",
  qr: "QR Code",
  card: "บัตรเครดิต",
  grab: "Grab",
  lineman: "LINE MAN",
};

export function SalesChart() {
  const { data: salesByChannel, isLoading } =
    api.dashboard.getSalesByChannel.useQuery();

  if (isLoading) {
    return (
      <div className="h-[300px] w-full animate-pulse rounded-2xl bg-gray-200"></div>
    );
  }

  if (!salesByChannel || Object.keys(salesByChannel).length === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
        <p className="text-[#8D6E63]">ยังไม่มีข้อมูลการขาย</p>
      </div>
    );
  }

  const data = Object.entries(salesByChannel).map(([key, value]) => ({
    name: PAYMENT_LABELS[key] || key,
    value: value.amount,
  }));

  return (
    <div className="flex h-[350px] w-full flex-col rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-[#3E2723]">
        สัดส่วนการขายตามช่องทาง
      </h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | undefined) =>
                `฿${Number(value ?? 0).toLocaleString()}`
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
