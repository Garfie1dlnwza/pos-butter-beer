"use client";

import { useState, useMemo } from "react";

export type FilterMode = "all" | "month" | "range";

interface DateFilterProps {
  onFilterChange: (filter: {
    mode: FilterMode;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [mode, setMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleModeChange = (newMode: FilterMode) => {
    setMode(newMode);

    if (newMode === "all") {
      onFilterChange({ mode: "all" });
    } else if (newMode === "month") {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = new Date(year!, month! - 1, 1, 0, 0, 0, 0);
      const end = new Date(year!, month!, 0, 23, 59, 59, 999);
      onFilterChange({ mode: "month", startDate: start, endDate: end });
    } else if (newMode === "range" && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      onFilterChange({ mode: "range", startDate: start, endDate: end });
    }
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    if (mode === "month") {
      const [year, month] = value.split("-").map(Number);
      const start = new Date(year!, month! - 1, 1, 0, 0, 0, 0);
      const end = new Date(year!, month!, 0, 23, 59, 59, 999);
      onFilterChange({ mode: "month", startDate: start, endDate: end });
    }
  };

  const handleRangeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
      if (mode === "range" && value && endDate) {
        const start = new Date(value);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        onFilterChange({ mode: "range", startDate: start, endDate: end });
      }
    } else {
      setEndDate(value);
      if (mode === "range" && startDate && value) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(value);
        end.setHours(23, 59, 59, 999);
        onFilterChange({ mode: "range", startDate: start, endDate: end });
      }
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-[#D7CCC8]/30 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Mode Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#5D4037]">แสดง:</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-[#D7CCC8]">
            <button
              onClick={() => handleModeChange("all")}
              className={`px-4 py-2 text-sm font-medium transition ${
                mode === "all"
                  ? "bg-[#3E2723] text-white"
                  : "bg-white text-[#5D4037] hover:bg-[#EFEBE9]"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => handleModeChange("month")}
              className={`border-x border-[#D7CCC8] px-4 py-2 text-sm font-medium transition ${
                mode === "month"
                  ? "bg-[#3E2723] text-white"
                  : "bg-white text-[#5D4037] hover:bg-[#EFEBE9]"
              }`}
            >
              เลือกเดือน
            </button>
            <button
              onClick={() => handleModeChange("range")}
              className={`px-4 py-2 text-sm font-medium transition ${
                mode === "range"
                  ? "bg-[#3E2723] text-white"
                  : "bg-white text-[#5D4037] hover:bg-[#EFEBE9]"
              }`}
            >
              เลือกช่วงเวลา
            </button>
          </div>
        </div>

        {/* Month Selector */}
        {mode === "month" && (
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-lg border border-[#D7CCC8] px-4 py-2 text-sm font-medium text-[#3E2723] focus:border-[#8D6E63] focus:ring-1 focus:ring-[#8D6E63] focus:outline-none"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Date Range Selector */}
        {mode === "range" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleRangeChange("start", e.target.value)}
              className="rounded-lg border border-[#D7CCC8] px-3 py-2 text-sm text-[#3E2723] focus:border-[#8D6E63] focus:ring-1 focus:ring-[#8D6E63] focus:outline-none"
            />
            <span className="text-[#8D6E63]">ถึง</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleRangeChange("end", e.target.value)}
              className="rounded-lg border border-[#D7CCC8] px-3 py-2 text-sm text-[#3E2723] focus:border-[#8D6E63] focus:ring-1 focus:ring-[#8D6E63] focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
