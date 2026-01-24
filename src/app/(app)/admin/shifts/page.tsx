"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export default function AdminShiftsPage() {
  const [dateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  // Fetch all shifts (Admin Access)
  const { data: shifts, isLoading } = api.shifts.getAll.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
    limit: 50,
  });

  // Calculate Daily Totals
  const dailyTotalSales =
    shifts?.reduce((sum, shift) => {
      // Manually sum up partial orders if available, or rely on future aggregation
      const shiftTotal =
        shift.orders?.reduce((acc, o) => acc + o.netAmount, 0) ?? 0;
      return sum + shiftTotal;
    }, 0) ?? 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">
            รายกะการทำงาน (Shift History)
          </h1>
          <p className="mt-1 text-sm text-[#8D6E63]">
            {dateRange.start.toLocaleDateString("th-TH")}
          </p>
        </div>
        <div className="flex gap-2">{/* Future Date Picker */}</div>
      </header>

      <main className="flex-1 overflow-auto p-6 lg:p-10">
        {/* Daily Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8D6E63]">จำนวนกะวันนี้</p>
            <p className="text-2xl font-bold text-[#3E2723]">
              {shifts?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8D6E63]">ยอดขายรวมทั้งวัน</p>
            <p className="text-2xl font-bold text-green-600">
              ฿{dailyTotalSales.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFF8E1] font-semibold text-[#5D4037]">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">พนักงาน</th>
                <th className="px-6 py-4 whitespace-nowrap">เวลาทำงาน</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">
                  เงินเปิดกะ
                </th>
                <th className="px-6 py-4 text-right whitespace-nowrap text-green-700">
                  เงินสด (Cash)
                </th>
                <th className="px-6 py-4 text-right whitespace-nowrap text-blue-700">
                  เงินโอน (QR)
                </th>
                <th className="px-6 py-4 text-right whitespace-nowrap">
                  ยอดรวม
                </th>
                <th className="px-6 py-4 text-right whitespace-nowrap">
                  ส่วนต่าง
                </th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                shifts?.map((shift) => {
                  // Calculate breakdown
                  let cashSales = 0;
                  let qrSales = 0;

                  if (shift.orders && Array.isArray(shift.orders)) {
                    shift.orders.forEach((o) => {
                      if (o.paymentMethod === "CASH") cashSales += o.netAmount;
                      else qrSales += o.netAmount;
                    });
                  }

                  const shiftTotal = cashSales + qrSales;

                  return (
                    <tr key={shift.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[#3E2723]">
                        {shift.user.name ?? "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-[#5D4037]">
                        {new Date(shift.startedAt).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <span className="block text-xs text-gray-400">
                          {shift.endedAt
                            ? new Date(shift.endedAt).toLocaleTimeString(
                                "th-TH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "กำลังเปิด"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        ฿{shift.openingCash.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-600">
                        +฿{cashSales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-blue-600">
                        +฿{qrSales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[#3E2723]">
                        ฿{shiftTotal.toLocaleString()}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          (shift.cashVariance ?? 0) < 0
                            ? "text-red-500"
                            : (shift.cashVariance ?? 0) > 0
                              ? "text-green-500"
                              : "text-gray-400"
                        }`}
                      >
                        {shift.cashVariance
                          ? `฿${shift.cashVariance.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            shift.status === "open"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {shift.status === "open" ? "OPEN" : "CLOSED"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
