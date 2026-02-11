"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";

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

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onSave: (data: StockFormData) => void;
  isLoading: boolean;
}

type Tab = "add" | "set";

export function StockManagementModal({
  isOpen,
  onClose,
  ingredient,
  onSave: onAddStock, // Rename prop to avoid confusion
  isLoading: isParentLoading,
}: StockManagementModalProps) {
  const { showToast } = useToast();
  const utils = api.useUtils();
  const [activeTab, setActiveTab] = useState<Tab>("add");

  // Form States
  const [quantity, setQuantity] = useState<string>("");
  const [costPerUnit, setCostPerUnit] = useState<string>("");
  const [note, setNote] = useState("");

  // API for Stock Take (Set Stock)
  const stockTakeMutation = api.inventory.stockTake.useMutation({
    onSuccess: () => {
      showToast("ปรับยอดสต็อกสำเร็จ", "success");
      void utils.ingredients.getAll.invalidate();
      void utils.inventory.getTransactions.invalidate();
      onClose();
    },
    onError: (err) => showToast(err.message, "error"),
  });

  useEffect(() => {
    if (isOpen && ingredient) {
      setActiveTab("add");
      setQuantity("");
      setCostPerUnit(ingredient.costPerUnit.toString());
      setNote("");
    }
  }, [isOpen, ingredient]);

  // When switching to SET, pre-fill with current stock
  useEffect(() => {
    if (activeTab === "set" && ingredient) {
      setQuantity(ingredient.currentStock.toString());
    } else if (activeTab === "add") {
      setQuantity("");
    }
  }, [activeTab, ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient) return;

    if (activeTab === "add") {
      // Use parent handler (Project convention seems to be parent handles 'add')
      onAddStock({
        quantity: parseFloat(quantity) || 0,
        costPerUnit: parseFloat(costPerUnit) || 0,
        note,
      });
    } else {
      // Handle Stock Take internally or via parent?
      // Since parent onSave expects specific StockFormData, and Stock Take has different input (actualQuantity),
      // it's cleaner to handle Stock Take here directly or add another prop.
      // Given the file structure, handling it here is easier.
      stockTakeMutation.mutate({
        ingredientId: ingredient.id,
        actualQuantity: parseFloat(quantity) || 0,
        note,
      });
    }
  };

  if (!ingredient) return null;

  const isLoading = isParentLoading || stockTakeMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="จัดการสต็อก">
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

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl bg-[#EFEBE9] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("add")}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
            activeTab === "add"
              ? "bg-white text-[#3E2723] shadow-sm"
              : "text-[#8D6E63] hover:text-[#5D4037]"
          }`}
        >
          + รับของเข้า (Purchase)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("set")}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
            activeTab === "set"
              ? "bg-white text-[#3E2723] shadow-sm"
              : "text-[#8D6E63] hover:text-[#5D4037]"
          }`}
        >
          ✎ แก้ไขจำนวน (Edit)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
              {activeTab === "add" ? "จำนวนที่รับเพิ่ม" : "จำนวนคงเหลือจริง"}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                placeholder="0"
                required
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-[#8D6E63]">
                {ingredient.unit}
              </span>
            </div>
            {activeTab === "set" && (
              <p className="mt-2 text-xs text-[#8D6E63]">
                * ระบบจะคำนวณส่วนต่าง (Difference) ให้อัตโนมัติ
              </p>
            )}
          </div>

          {activeTab === "add" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
                ต้นทุนต่อหน่วย (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
              หมายเหตุ ({activeTab === "add" ? "ไม่บังคับ" : "บังคับ"})
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
              placeholder={
                activeTab === "add"
                  ? "เช่น Lot #123"
                  : "เช่น นับสต็อกสิ้นเดือน, ปรับปรุงยอด"
              }
              required={activeTab === "set"}
            />
          </div>
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
            disabled={isLoading || !quantity}
            className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
              activeTab === "add"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading
              ? "กำลังบันทึก..."
              : activeTab === "add"
                ? "ยืนยันรับของ"
                : "บันทึกยอดจริง"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
