"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";

interface IngredientFormData {
  name: string;
  unit: string;
  costPerUnit: number;
  minStock: number;
}

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

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: Ingredient | null;
  onSave: (data: IngredientFormData) => void;
  isLoading: boolean;
}

export function IngredientModal({
  isOpen,
  onClose,
  ingredient,
  onSave,
  isLoading,
}: IngredientModalProps) {
  // Use string state for number inputs to allow typing decimals like 0.08
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    costPerUnit: "",
    minStock: "",
  });

  // Reset form when ingredient changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: ingredient?.name ?? "",
        unit: ingredient?.unit ?? "",
        costPerUnit: ingredient?.costPerUnit?.toString() ?? "",
        minStock: ingredient?.minStock?.toString() ?? "",
      });
    }
  }, [isOpen, ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse strings to numbers on submit
    onSave({
      name: formData.name,
      unit: formData.unit,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
      minStock: parseFloat(formData.minStock) || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredient ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบใหม่"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
            ชื่อวัตถุดิบ
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="เช่น นมสด, น้ำตาล"
            required
          />
        </div>

        {/* Unit & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
              หน่วย
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
              placeholder="ml, g, ชิ้น"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
              ต้นทุน/หน่วย (฿)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.costPerUnit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  costPerUnit: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
              placeholder="0.08"
              required
            />
          </div>
        </div>

        {/* Min Stock */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
            จุดสั่งซื้อใหม่ (Min Stock)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={formData.minStock}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, minStock: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="1000"
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
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl bg-[#3E2723] py-3 text-sm font-bold text-white transition hover:bg-[#2D1B18] disabled:opacity-50"
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
