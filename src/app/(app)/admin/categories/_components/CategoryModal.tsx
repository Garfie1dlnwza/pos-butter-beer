"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";

interface CategoryFormData {
  name: string;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (data: CategoryFormData) => void;
  isLoading: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
  isLoading,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name ?? "",
        sortOrder: category?.sortOrder ?? 0,
      });
    }
  }, [isOpen, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
            ชื่อหมวดหมู่
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="เช่น Coffee, Tea"
            required
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
            ลำดับการแสดง
          </label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sortOrder: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="0"
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
