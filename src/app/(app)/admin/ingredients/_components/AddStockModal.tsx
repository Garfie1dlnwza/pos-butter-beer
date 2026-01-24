"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  currentStock: number;
  minStock: number;
  deletedAt: Date | null;
  stockLots: Array<{
    id: string;
    quantity: number;
    costPerUnit: number;
    remainingQty: number;
    note: string | null;
    createdAt: Date;
  }>;
}

interface StockFormData {
  quantity: number;
  costPerUnit: number;
  note: string;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onSave: (data: StockFormData) => void;
  isLoading: boolean;
}

export function AddStockModal({
  isOpen,
  onClose,
  ingredient,
  onSave,
  isLoading,
}: AddStockModalProps) {
  const [formData, setFormData] = useState<StockFormData>({
    quantity: 0,
    costPerUnit: 0,
    note: "",
  });

  // Reset form when ingredient changes
  useEffect(() => {
    if (isOpen && ingredient) {
      setFormData({
        quantity: 0,
        costPerUnit: ingredient.costPerUnit,
        note: "",
      });
    }
  }, [isOpen, ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!ingredient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="เพิ่มสต็อก">
      {/* Ingredient Info */}
      <div className="mb-5 rounded-xl bg-[#FFF8E1] p-4">
        <p className="text-lg font-bold text-[#3E2723]">{ingredient.name}</p>
        <p className="text-sm text-[#8D6E63]">
          สต็อกปัจจุบัน:{" "}
          <span className="font-semibold">
            {ingredient.currentStock.toLocaleString()}
          </span>{" "}
          {ingredient.unit}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quantity & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
              จำนวน
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
              ต้นทุน/หน่วย (฿)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.costPerUnit || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  costPerUnit: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <input
            type="text"
            value={formData.note}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, note: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="เช่น Lot #123, ซื้อจาก Makro"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[#D7CCC8] py-3 text-sm font-semibold text-[#8D6E63] transition hover:bg-[#F5F5F5]"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isLoading || formData.quantity <= 0}
            className="flex-1 cursor-pointer rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading ? "กำลังบันทึก..." : "เพิ่มสต็อก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
