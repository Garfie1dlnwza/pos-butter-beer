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
