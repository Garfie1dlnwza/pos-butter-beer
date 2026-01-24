"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";

interface CloseShiftModalProps {
  shiftId: string;
  expectedCash: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseShiftModal({
  shiftId,
  expectedCash,
  onClose,
  onSuccess,
}: CloseShiftModalProps) {
  const { showToast } = useToast();
  const [closingCash, setClosingCash] = useState("");
  const [note, setNote] = useState("");

  const closeShift = api.shifts.closeShift.useMutation({
    onSuccess,
    onError: (e) => showToast("เกิดข้อผิดพลาด: " + e.message, "error"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift.mutate({
      shiftId,
      closingCash: parseFloat(closingCash) || 0,
      note: note || undefined,
    });
  };

  const actualCash = parseFloat(closingCash) || 0;
  const variance = actualCash - expectedCash;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[#3E2723]">🔐 ปิดกะ</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Expected Cash */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-[#8D6E63]">เงินสดที่ควรมี</p>
            <p className="text-2xl font-bold text-amber-600">
              ฿{expectedCash.toLocaleString()}
            </p>
          </div>

          {/* Closing Cash */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              เงินสดที่นับได้จริง (บาท) *
            </label>
            <input
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(e.target.value)}
              required
              min="0"
              step="1"
              placeholder="ใส่จำนวนเงินที่นับได้"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-red-500 focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>

          {/* Variance Display */}
          {closingCash && (
            <div
              className={`rounded-lg p-4 ${
                variance === 0
                  ? "border border-green-200 bg-green-50"
                  : variance > 0
                    ? "border border-blue-200 bg-blue-50"
                    : "border border-red-200 bg-red-50"
              }`}
            >
              <p className="text-sm text-gray-600">ส่วนต่าง</p>
              <p
                className={`text-2xl font-bold ${
                  variance === 0
                    ? "text-green-600"
                    : variance > 0
                      ? "text-blue-600"
                      : "text-red-600"
                }`}
              >
                {variance >= 0 ? "+" : ""}฿{variance.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {variance === 0
                  ? "✅ เงินสดตรง!"
                  : variance > 0
                    ? "💰 เงินเกิน"
                    : "⚠️ เงินขาด"}
              </p>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              หมายเหตุ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น เงินทอนผิดพลาด, มีลูกค้า refund"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={closeShift.isPending}
              className="rounded-lg bg-red-600 px-6 py-2 font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {closeShift.isPending ? "กำลังปิด..." : "ปิดกะ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
