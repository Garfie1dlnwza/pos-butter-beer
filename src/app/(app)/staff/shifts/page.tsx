"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";
import { OpenShiftModal } from "./_components/OpenShiftModal";
import { CloseShiftModal } from "./_components/CloseShiftModal";

export default function ShiftsPage() {
  const { showToast } = useToast();
  const utils = api.useUtils();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const { data: currentShift, isLoading } =
    api.shifts.getCurrentShift.useQuery();
  const { data: shiftSummary } = api.shifts.getShiftSummary.useQuery(
    { shiftId: currentShift?.id ?? "" },
    { enabled: !!currentShift?.id },
  );

  const handleSuccess = () => {
    showToast("บันทึกสำเร็จ", "success");
    void utils.shifts.invalidate();
    setShowOpenModal(false);
    setShowCloseModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
          Loading
        </span>
      </div>
    );
  }

  // No open shift - show open shift button
  if (!currentShift) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
        <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">⏰ จัดการกะ</h1>
            <p className="mt-1 text-sm text-[#8D6E63]">
              เปิด/ปิดกะและตรวจสอบยอดเงินสด
            </p>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
              <span className="text-5xl">🔒</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#3E2723]">
              ยังไม่มีกะที่เปิดอยู่
            </h2>
            <p className="mb-6 text-[#8D6E63]">กรุณาเปิดกะก่อนเริ่มขาย</p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="rounded-xl bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-700"
            >
              🚀 เปิดกะใหม่
            </button>
          </div>
        </main>

        {showOpenModal && (
          <OpenShiftModal
            onClose={() => setShowOpenModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    );
  }

  // Has open shift - show shift details
  const cashSales = shiftSummary?.summary.cashSales ?? 0;
  const expectedCash = currentShift.openingCash + cashSales;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">⏰ กะปัจจุบัน</h1>
          <p className="mt-1 text-sm text-[#8D6E63]">
            เปิดเมื่อ {new Date(currentShift.startedAt).toLocaleString("th-TH")}
          </p>
        </div>
        <button
          onClick={() => setShowCloseModal(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
        >
          🔐 ปิดกะ
        </button>
      </header>

      <main className="flex-1 overflow-auto p-6 lg:p-10">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#8D6E63]">เงินเปิดกะ</p>
            <p className="mt-2 text-2xl font-bold text-[#3E2723]">
              ฿{currentShift.openingCash.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#8D6E63]">ยอดขายเงินสด</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              +฿{cashSales.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#8D6E63]">ยอดขาย QR</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              ฿{(shiftSummary?.summary.qrSales ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-[#8D6E63]">เงินสดที่ควรมี</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              ฿{expectedCash.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#3E2723]">
              สรุปยอดขาย
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-[#5D4037]">จำนวนออเดอร์</span>
                <span className="font-bold text-[#3E2723]">
                  {shiftSummary?.summary.totalOrders ?? 0} รายการ
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-[#5D4037]">ยอดขายรวม</span>
                <span className="font-bold text-[#3E2723]">
                  ฿{(shiftSummary?.summary.totalSales ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-[#5D4037]">เงินสด</span>
                <span className="font-bold text-green-600">
                  ฿{(shiftSummary?.summary.cashSales ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-[#5D4037]">QR Payment</span>
                <span className="font-bold text-blue-600">
                  ฿{(shiftSummary?.summary.qrSales ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#5D4037]">อื่นๆ</span>
                <span className="font-bold text-gray-600">
                  ฿{(shiftSummary?.summary.otherSales ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#3E2723]">ข้อมูลกะ</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-[#5D4037]">เวลาเปิดกะ</span>
                <span className="font-medium text-[#3E2723]">
                  {new Date(currentShift.startedAt).toLocaleTimeString(
                    "th-TH",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-[#5D4037]">เปิดมาแล้ว</span>
                <span className="font-medium text-[#3E2723]">
                  {Math.round(
                    (Date.now() - new Date(currentShift.startedAt).getTime()) /
                      (1000 * 60 * 60),
                  )}{" "}
                  ชั่วโมง
                </span>
              </div>
              {currentShift.note && (
                <div className="flex justify-between py-2">
                  <span className="text-[#5D4037]">หมายเหตุ</span>
                  <span className="font-medium text-[#3E2723]">
                    {currentShift.note}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCloseModal && currentShift && (
        <CloseShiftModal
          shiftId={currentShift.id}
          expectedCash={expectedCash}
          onClose={() => setShowCloseModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

function ShiftHistory() {
  const { data: shifts } = api.shifts.getAll.useQuery({ limit: 10 });

  if (!shifts || shifts.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-[#3E2723]">
        📜 ประวัติการปิดกะ (10 รายการล่าสุด)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-[#8D6E63]">
            <tr>
              <th className="pb-3 font-semibold">วันที่</th>
              <th className="pb-3 font-semibold">พนักงาน</th>
              <th className="pb-3 text-right font-semibold">เวลา</th>
              <th className="pb-3 text-right font-semibold">ยอดขาย</th>
              <th className="pb-3 text-right font-semibold">ส่วนต่าง</th>
              <th className="pb-3 text-center font-semibold">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shifts.map((shift) => (
              <tr key={shift.id} className="group hover:bg-[#FAFAFA]">
                <td className="py-3 text-[#3E2723]">
                  {new Date(shift.startedAt).toLocaleDateString("th-TH")}
                </td>
                <td className="py-3 text-[#5D4037]">
                  {shift.user.name ?? "Unknown"}
                </td>
                <td className="py-3 text-right text-[#5D4037]">
                  {new Date(shift.startedAt).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" - "}
                  {shift.endedAt
                    ? new Date(shift.endedAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "กำลังเปิด"}
                </td>
                <td className="py-3 text-right font-medium text-[#3E2723]">
                  {shift.status === "closed" ? (
                    // This is approximate since we don't fetch total sales in list for now,
                    // or we rely on closingCash if available?
                    // Actually getAll returns order count.
                    // Ideally we should show total sales if needed.
                    // For now let's just show order count to be safe or verify what getAll returns.
                    // getAll returns _count.orders.
                    <span>{shift._count.orders} ออเดอร์</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 text-right font-medium">
                  {shift.cashVariance !== null ? (
                    <span
                      className={
                        shift.cashVariance === 0
                          ? "text-green-600"
                          : shift.cashVariance > 0
                            ? "text-blue-600"
                            : "text-red-600"
                      }
                    >
                      {shift.cashVariance > 0 ? "+" : ""}
                      {shift.cashVariance.toLocaleString()}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      shift.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {shift.status === "open" ? "เปิดอยู่" : "ปิดแล้ว"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
