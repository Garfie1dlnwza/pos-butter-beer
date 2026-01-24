"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { IngredientsTable } from "./_components/IngredientsTable";
import { IngredientModal } from "./_components/IngredientModal";
import { AddStockModal } from "./_components/AddStockModal";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [addStockIngredient, setAddStockIngredient] =
    useState<Ingredient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const utils = api.useUtils();
  const { data: ingredients, isLoading } = api.ingredients.getAll.useQuery();

  const createMutation = api.ingredients.create.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      setShowCreateModal(false);
    },
  });

  const updateMutation = api.ingredients.update.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      setEditingIngredient(null);
    },
  });

  const deleteMutation = api.ingredients.delete.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
    },
  });

  const addStockMutation = api.ingredients.addStock.useMutation({
    onSuccess: () => {
      void utils.ingredients.getAll.invalidate();
      setAddStockIngredient(null);
    },
  });

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

  const filteredIngredients =
    ingredients?.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  // Loading State (matching POS style)
  if (isLoading) {
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
           จัดการวัตถุดิบ
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            จัดการสต็อกและต้นทุนวัตถุดิบทั้งหมด
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#3E2723] px-5 py-2.5 font-bold text-white shadow-lg transition hover:bg-[#2D1B18] active:scale-[0.98]"
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
          เพิ่มวัตถุดิบ
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
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
                  ingredients.filter((i) => i.currentStock <= i.minStock * 0.5)
                    .length
                }
              </p>
            </div>
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

      <AddStockModal
        isOpen={!!addStockIngredient}
        onClose={() => setAddStockIngredient(null)}
        ingredient={addStockIngredient}
        onSave={handleAddStock}
        isLoading={addStockMutation.isPending}
      />
    </div>
  );
}
