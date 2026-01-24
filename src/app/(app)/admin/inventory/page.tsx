"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";
import { StockModal } from "./_components/StockModal";

const TRANSACTION_TYPES = {
  PURCHASE: { label: "รับเข้า", color: "bg-green-100 text-green-700" },
  SALE: { label: "ขายออก", color: "bg-blue-100 text-blue-700" },
  ADJUSTMENT: { label: "ปรับปรุง", color: "bg-yellow-100 text-yellow-700" },
  WASTE: { label: "ของเสีย", color: "bg-red-100 text-red-700" },
  STOCK_TAKE: { label: "นับสต็อก", color: "bg-purple-100 text-purple-700" },
};

export default function InventoryPage() {
  const { showToast } = useToast();
  const utils = api.useUtils();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "adjust" | "take">("add");
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null,
  );

  const { data: ingredients } = api.ingredients.getAll.useQuery();
  const { data: transactions, isLoading } =
    api.inventory.getTransactions.useQuery({
      limit: 50,
    });

  const handleOpenModal = (
    type: "add" | "adjust" | "take",
    ingredientId?: string,
  ) => {
    setModalType(type);
    setSelectedIngredient(ingredientId ?? null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    showToast("บันทึกสำเร็จ", "success");
    void utils.inventory.invalidate();
    void utils.ingredients.invalidate();
    setShowModal(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">📦 จัดการสต็อก</h1>
          <p className="mt-1 text-sm text-[#8D6E63]">
            รับเข้า/ปรับปรุง/นับสต็อกวัตถุดิบ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal("add")}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-green-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            รับสต็อก
          </button>
          <button
            onClick={() => handleOpenModal("adjust")}
            className="flex items-center gap-2 rounded-xl bg-yellow-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-yellow-700"
          >
            ปรับปรุง
          </button>
          <button
            onClick={() => handleOpenModal("take")}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-purple-700"
          >
            นับสต็อก
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Stock */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-[#3E2723]">
                สต็อกปัจจุบัน
              </h3>
              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {ingredients?.map((ing) => (
                  <div
                    key={ing.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      ing.currentStock <= ing.minStock
                        ? "border border-red-200 bg-red-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-[#3E2723]">{ing.name}</p>
                      <p className="text-xs text-[#8D6E63]">
                        ต่ำสุด: {ing.minStock} {ing.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          ing.currentStock <= ing.minStock
                            ? "text-red-600"
                            : "text-[#3E2723]"
                        }`}
                      >
                        {ing.currentStock.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#8D6E63]">{ing.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-[#3E2723]">
                ประวัติการเคลื่อนไหว
              </h3>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-[#F5F5F5] text-[#8D6E63]">
                        <th className="pb-3 text-left font-bold">วันที่</th>
                        <th className="pb-3 text-left font-bold">วัตถุดิบ</th>
                        <th className="pb-3 text-left font-bold">ประเภท</th>
                        <th className="pb-3 text-right font-bold">จำนวน</th>
                        <th className="pb-3 text-left font-bold">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                      {transactions.map((t) => {
                        const typeInfo =
                          TRANSACTION_TYPES[
                            t.type as keyof typeof TRANSACTION_TYPES
                          ];
                        return (
                          <tr key={t.id} className="hover:bg-[#FAFAFA]">
                            <td className="py-3 text-[#5D4037]">
                              {new Date(t.createdAt).toLocaleDateString(
                                "th-TH",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>
                            <td className="py-3 font-medium text-[#3E2723]">
                              {t.ingredient.name}
                            </td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${typeInfo?.color ?? "bg-gray-100"}`}
                              >
                                {typeInfo?.label ?? t.type}
                              </span>
                            </td>
                            <td
                              className={`py-3 text-right font-mono font-semibold ${
                                t.quantity >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {t.quantity >= 0 ? "+" : ""}
                              {t.quantity.toLocaleString()} {t.ingredient.unit}
                            </td>
                            <td className="max-w-[150px] truncate py-3 text-xs text-[#8D6E63]">
                              {t.note ?? "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-[#8D6E63]">
                  ยังไม่มีประวัติการเคลื่อนไหว
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <StockModal
          type={modalType}
          ingredientId={selectedIngredient}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
