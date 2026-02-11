"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";

interface OpenShiftModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenShiftModal({ onClose, onSuccess }: OpenShiftModalProps) {
  const { showToast } = useToast();
  const [openingCash, setOpeningCash] = useState("");
  const [note, setNote] = useState("");

  const openShift = api.shifts.openShift.useMutation({
    onSuccess,
    onError: (e) => showToast("เกิดข้อผิดพลาด: " + e.message, "error"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift.mutate({
      openingCash: parseFloat(openingCash) || 0,
      note: note || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[#3E2723]">🚀 เปิดกะใหม่</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              เงินเปิดกะ (บาท) *
            </label>
            <input
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              required
              min="0"
              step="1"
              placeholder="เช่น 1000"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              ใส่จำนวนเงินสดที่มีอยู่ในลิ้นชักก่อนเริ่มขาย
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              หมายเหตุ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น กะเช้า, พนักงานใหม่"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Quick buttons */}
          <div>
            <p className="mb-2 text-sm text-[#8D6E63]">เลือกด่วน:</p>
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 2000, 3000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setOpeningCash(amount.toString())}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  ฿{amount.toLocaleString()}
                </button>
              ))}
            </div>
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
              disabled={openShift.isPending}
              className="rounded-lg bg-green-600 px-6 py-2 font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {openShift.isPending ? "กำลังเปิด..." : "เปิดกะ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
