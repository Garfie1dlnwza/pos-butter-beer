"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { IngredientsTable } from "./_components/IngredientsTable";
import { IngredientModal } from "./_components/IngredientModal";
import { StockManagementModal } from "./_components/StockManagementModal";
import { useToast } from "@/components/Toast";
import { StockModal } from "./_components/StockModal";

// Re-defining transaction types here or import if shared
const TRANSACTION_TYPES = {
  PURCHASE: { label: "รับเข้า", color: "bg-green-100 text-green-700" },
  SALE: { label: "ขายออก", color: "bg-blue-100 text-blue-700" },
  ADJUSTMENT: { label: "ปรับปรุง", color: "bg-yellow-100 text-yellow-700" },
  WASTE: { label: "ของเสีย", color: "bg-red-100 text-red-700" },
  STOCK_TAKE: { label: "นับสต็อก", color: "bg-purple-100 text-purple-700" },
};

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

interface IngredientFormData {
  name: string;
  unit: string;
  costPerUnit: number;
  minStock: number;
}

interface StockFormData {
  quantity: number;
  costPerUnit: number;
  note: string;
}

export default function IngredientsPage() {
  const { showToast } = useToast();
  const utils = api.useUtils();

  // UI States
  const [activeTab, setActiveTab] = useState<"ingredients" | "transactions">(
    "ingredients",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Stock Action States
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalType, setStockModalType] = useState<
    "add" | "adjust" | "take"
  >("add");
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null,
  );

  // Data Editing States
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [addStockIngredient, setAddStockIngredient] =
    useState<Ingredient | null>(null); // For direct add from table

  // Queries
  const { data: ingredients, isLoading: isLoadingIngredients } =
    api.ingredients.getAll.useQuery();
  const { data: transactions, isLoading: isLoadingTransactions } =
    api.inventory.getTransactions.useQuery({
      limit: 50,
    });

  // Mutations
  const createMutation = api.ingredients.create.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      setShowCreateModal(false);
      showToast("สร้างวัตถุดิบสำเร็จ", "success");
    },
  });

  const updateMutation = api.ingredients.update.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      setEditingIngredient(null);
      showToast("แก้ไขสำเร็จ", "success");
    },
  });

  const deleteMutation = api.ingredients.delete.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      showToast("ลบสำเร็จ", "success");
    },
  });

  const addStockMutation = api.ingredients.addStock.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      void utils.inventory.getTransactions.invalidate();
      setAddStockIngredient(null);
      showToast("เพิ่มสต็อกสำเร็จ", "success");
    },
  });

  // Handlers
  const handleCreate = (data: IngredientFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: IngredientFormData) => {
    if (!editingIngredient) return;
    updateMutation.mutate({ id: editingIngredient.id, ...data });
  };

  const handleDelete = (ingredient: Ingredient) => {
    if (confirm(`ต้องการลบ "${ingredient.name}" หรือไม่?`)) {
      deleteMutation.mutate({ id: ingredient.id });
    }
  };

  const handleAddStock = (data: StockFormData) => {
    if (!addStockIngredient) return;
    addStockMutation.mutate({
      ingredientId: addStockIngredient.id,
      ...data,
    });
  };

  const handleOpenStockModal = (type: "add" | "adjust" | "take") => {
    setStockModalType(type);
    setSelectedIngredient(null); // General action
    setShowStockModal(true);
  };

  const handleStockSuccess = () => {
    showToast("บันทึก Transaction สำเร็จ", "success");
    void utils.inventory.invalidate();
    void utils.ingredients.invalidate();
    setShowStockModal(false);
  };

  const filteredIngredients =
    ingredients?.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  if (isLoadingIngredients && !ingredients) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
          Loading
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
            จัดการสต็อก & วัตถุดิบ
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            จัดการข้อมูลวัตถุดิบและติดตามความเคลื่อนไหวสต็อก
          </p>
        </div>
        <div className="flex gap-2">
          {/* Quick Actions for Stock */}
          <button
            onClick={() => handleOpenStockModal("add")}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-green-700"
          >
            + รับสต็อก
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#3E2723] px-5 py-2.5 font-bold text-white shadow-lg transition hover:bg-[#2D1B18] active:scale-[0.98]"
          >
            + เพิ่มวัตถุดิบใหม่
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="mt-4 px-6 lg:px-10">
        <div className="flex gap-6 border-b border-[#D7CCC8]/30">
          <button
            onClick={() => setActiveTab("ingredients")}
            className={`pb-3 text-sm font-bold transition-all ${
              activeTab === "ingredients"
                ? "border-b-2 border-[#3E2723] text-[#3E2723]"
                : "text-[#8D6E63] hover:text-[#5D4037]"
            }`}
          >
            รายการวัตถุดิบ
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 text-sm font-bold transition-all ${
              activeTab === "transactions"
                ? "border-b-2 border-[#3E2723] text-[#3E2723]"
                : "text-[#8D6E63] hover:text-[#5D4037]"
            }`}
          >
            ประวัติความเคลื่อนไหว (Transactions)
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {activeTab === "ingredients" && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <svg
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#BDBDBD]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาวัตถุดิบ..."
                  className="w-full rounded-xl border border-[#D7CCC8]/50 bg-white py-3 pr-4 pl-12 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:shadow-sm"
                />
              </div>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
              <IngredientsTable
                ingredients={filteredIngredients}
                onEdit={setEditingIngredient}
                onDelete={handleDelete}
                onAddStock={setAddStockIngredient}
              />
            </div>

            {/* Summary Stats */}
            {ingredients && ingredients.length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-[#8D6E63]">
                    วัตถุดิบทั้งหมด
                  </p>
                  <p className="text-3xl font-bold text-[#3E2723]">
                    {ingredients.length}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-medium text-amber-700">ใกล้หมด</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {
                      ingredients.filter(
                        (i) =>
                          i.currentStock <= i.minStock &&
                          i.currentStock > i.minStock * 0.5,
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <p className="text-sm font-medium text-red-700">ต่ำมาก</p>
                  <p className="text-3xl font-bold text-red-600">
                    {
                      ingredients.filter(
                        (i) => i.currentStock <= i.minStock * 0.5,
                      ).length
                    }
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "transactions" && (
          <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#3E2723]">
                ประวัติการเคลื่อนไหวล่าสุด
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenStockModal("adjust")}
                  className="rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800 transition hover:bg-yellow-200"
                >
                  บันทึกปรับปรุง (Adjust)
                </button>
                <button
                  onClick={() => handleOpenStockModal("take")}
                  className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-800 transition hover:bg-purple-200"
                >
                  บันทึกนับสต็อก (Stock Take)
                </button>
              </div>
            </div>

            {isLoadingTransactions ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FFF8E1] text-[#5D4037]">
                    <tr>
                      <th className="rounded-l-lg px-4 py-3 text-left font-bold">
                        วันที่
                      </th>
                      <th className="px-4 py-3 text-left font-bold">
                        วัตถุดิบ
                      </th>
                      <th className="px-4 py-3 text-left font-bold">ประเภท</th>
                      <th className="px-4 py-3 text-right font-bold">จำนวน</th>
                      <th className="rounded-r-lg px-4 py-3 text-left font-bold">
                        หมายเหตุ
                      </th>
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
                          <td className="px-4 py-3 text-[#5D4037]">
                            {new Date(t.createdAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#3E2723]">
                            {t.ingredient.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${typeInfo?.color ?? "bg-gray-100"}`}
                            >
                              {typeInfo?.label ?? t.type}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-mono font-semibold ${
                              t.quantity >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {t.quantity >= 0 ? "+" : ""}
                            {t.quantity.toLocaleString()} {t.ingredient.unit}
                          </td>
                          <td className="max-w-[200px] truncate px-4 py-3 text-xs text-[#8D6E63]">
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
        )}
      </main>

      {/* Modals */}
      <IngredientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
      />

      <IngredientModal
        isOpen={!!editingIngredient}
        onClose={() => setEditingIngredient(null)}
        ingredient={editingIngredient}
        onSave={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      {/* Quick Add Stock Modal (from Ingredients Table) */}
      <StockManagementModal
        isOpen={!!addStockIngredient}
        onClose={() => setAddStockIngredient(null)}
        ingredient={addStockIngredient}
        onSave={handleAddStock}
        isLoading={addStockMutation.isPending}
      />

      {/* General Stock Action Modal */}
      {showStockModal && (
        <StockModal
          type={stockModalType}
          ingredientId={selectedIngredient}
          onClose={() => setShowStockModal(false)}
          onSuccess={handleStockSuccess}
        />
      )}
    </div>
  );
}
