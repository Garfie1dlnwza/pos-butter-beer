"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize with today's date if not present
  const today = new Date().toISOString().split("T")[0];
  const defaultStart = searchParams.get("startDate") ?? today;
  const defaultEnd = searchParams.get("endDate") ?? today;

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);

  const updateParams = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("startDate", start);
    params.set("endDate", end);
    router.push(pathname + "?" + params.toString());
  }, [searchParams, start, end, router, pathname]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div>
        <label className="mb-1 block text-xs font-bold text-[#8D6E63] uppercase">
          ตั้งแต่วันที่
        </label>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full rounded-xl border border-[#D7CCC8]/50 bg-white px-4 py-2 text-[#3E2723] shadow-sm outline-none focus:border-[#8D6E63] focus:ring-1 focus:ring-[#8D6E63] sm:w-auto"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-[#8D6E63] uppercase">
          ถึงวันที่
        </label>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full rounded-xl border border-[#D7CCC8]/50 bg-white px-4 py-2 text-[#3E2723] shadow-sm outline-none focus:border-[#8D6E63] focus:ring-1 focus:ring-[#8D6E63] sm:w-auto"
        />
      </div>
      <button
        onClick={updateParams}
        className="mt-2 rounded-xl bg-[#3E2723] px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-[#2D1B18] active:scale-[0.98] sm:mt-0"
      >
        ค้นหา
      </button>
    </div>
  );
}
