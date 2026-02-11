"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";

interface StockModalProps {
  type: "add" | "adjust" | "take";
  ingredientId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockModal({
  type,
  ingredientId,
  onClose,
  onSuccess,
}: StockModalProps) {
  const { showToast } = useToast();
  const { data: ingredients } = api.ingredients.getAll.useQuery();

  const [selectedIngredient, setSelectedIngredient] = useState(
    ingredientId ?? "",
  );
  const [quantity, setQuantity] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [adjustType, setAdjustType] = useState<"ADJUSTMENT" | "WASTE">(
    "ADJUSTMENT",
  );
  const [note, setNote] = useState("");

  const addStock = api.inventory.addStock.useMutation({
    onSuccess,
    onError: (e) => showToast("เกิดข้อผิดพลาด: " + e.message, "error"),
  });

  const adjustStock = api.inventory.adjustStock.useMutation({
    onSuccess,
    onError: (e) => showToast("เกิดข้อผิดพลาด: " + e.message, "error"),
  });

  const stockTake = api.inventory.stockTake.useMutation({
    onSuccess,
    onError: (e) => showToast("เกิดข้อผิดพลาด: " + e.message, "error"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredient) {
      showToast("กรุณาเลือกวัตถุดิบ", "error");
      return;
    }

    if (type === "add") {
      addStock.mutate({
        ingredientId: selectedIngredient,
        quantity: parseFloat(quantity),
        costPerUnit: parseFloat(costPerUnit),
        note: note || undefined,
      });
    } else if (type === "adjust") {
      adjustStock.mutate({
        ingredientId: selectedIngredient,
        quantity: parseFloat(quantity),
        type: adjustType,
        note: note || undefined,
      });
    } else if (type === "take") {
      stockTake.mutate({
        ingredientId: selectedIngredient,
        actualQuantity: parseFloat(quantity),
        note: note || undefined,
      });
    }
  };

  const isLoading =
    addStock.isPending || adjustStock.isPending || stockTake.isPending;

  const titles = {
    add: "รับสต็อกเข้า",
    adjust: "ปรับปรุงสต็อก",
    take: "นับสต็อก",
  };

  const selectedIng = ingredients?.find((i) => i.id === selectedIngredient);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[#3E2723]">{titles[type]}</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Ingredient Selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              วัตถุดิบ *
            </label>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- เลือกวัตถุดิบ --</option>
              {ingredients?.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} (คงเหลือ: {ing.currentStock} {ing.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Adjust Type (only for adjust) */}
          {type === "adjust" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5D4037]">
                ประเภท
              </label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="adjustType"
                    value="ADJUSTMENT"
                    checked={adjustType === "ADJUSTMENT"}
                    onChange={() => setAdjustType("ADJUSTMENT")}
                    className="text-amber-600"
                  />
                  <span className="text-sm">ปรับปรุง (+/-)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="adjustType"
                    value="WASTE"
                    checked={adjustType === "WASTE"}
                    onChange={() => setAdjustType("WASTE")}
                    className="text-red-600"
                  />
                  <span className="text-sm">ของเสีย/หมดอายุ</span>
                </label>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              {type === "take" ? "จำนวนที่นับได้จริง" : "จำนวน"} *
              {selectedIng && ` (${selectedIng.unit})`}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              step="0.01"
              placeholder={type === "adjust" ? "ใส่ - เพื่อลด เช่น -10" : "0"}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-amber-500"
            />
            {type === "take" && selectedIng && (
              <p className="mt-1 text-xs text-gray-500">
                สต็อกในระบบ: {selectedIng.currentStock} {selectedIng.unit}
              </p>
            )}
          </div>

          {/* Cost per Unit (only for add) */}
          {type === "add" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5D4037]">
                ต้นทุนต่อหน่วย (บาท) *
              </label>
              <input
                type="number"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-amber-500"
              />
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
              placeholder="เช่น รับจาก supplier, หมดอายุ, ฯลฯ"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-amber-500"
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
              disabled={isLoading}
              className={`rounded-lg px-5 py-2 font-medium text-white transition disabled:opacity-50 ${
                type === "add"
                  ? "bg-green-600 hover:bg-green-700"
                  : type === "adjust"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
