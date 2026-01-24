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
  const [formData, setFormData] = useState<IngredientFormData>({
    name: "",
    unit: "",
    costPerUnit: 0,
    minStock: 0,
  });

  // Reset form when ingredient changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: ingredient?.name ?? "",
        unit: ingredient?.unit ?? "",
        costPerUnit: ingredient?.costPerUnit ?? 0,
        minStock: ingredient?.minStock ?? 0,
      });
    }
  }, [isOpen, ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

        {/* Min Stock */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
            จุดสั่งซื้อใหม่ (Min Stock)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.minStock || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minStock: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
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
