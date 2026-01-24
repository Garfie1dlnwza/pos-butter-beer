"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

interface SalesChartProps {
  data: DailySales[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
        <p className="text-[#8D6E63]">ไม่มีข้อมูลสำหรับช่วงเวลานี้</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-bold text-[#3E2723]">แนวโน้มยอดขาย</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8D6E63" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8D6E63" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#EFEBE9"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(str) => {
                const date = new Date(str);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
              stroke="#A1887F"
              fontSize={12}
              tickMargin={10}
            />
            <YAxis stroke="#A1887F" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                border: "1px solid #EFEBE9",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [
                `฿${value.toLocaleString()}`,
                "ยอดขาย",
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#5D4037"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
