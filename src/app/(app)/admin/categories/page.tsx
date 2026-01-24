"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { CategoriesTable } from "./_components/CategoriesTable";
import { CategoryModal } from "./_components/CategoryModal";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

interface CategoryFormData {
  name: string;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const utils = api.useUtils();
  const { data: categories, isLoading } = api.categories.getAllAdmin.useQuery();

  const createMutation = api.categories.create.useMutation({
    onSuccess: () => {
      void utils.categories.getAllAdmin.invalidate();
      setShowCreateModal(false);
    },
  });

  const updateMutation = api.categories.update.useMutation({
    onSuccess: () => {
      void utils.categories.getAllAdmin.invalidate();
      setEditingCategory(null);
    },
  });

  const deleteMutation = api.categories.delete.useMutation({
    onSuccess: () => {
      void utils.categories.getAllAdmin.invalidate();
    },
  });

  const handleCreate = (data: CategoryFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: CategoryFormData) => {
    if (!editingCategory) return;
    updateMutation.mutate({
      id: editingCategory.id,
      ...data,
    });
  };

  const handleDelete = (category: Category) => {
    if (category._count?.products && category._count.products > 0) {
      alert("ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้");
      return;
    }
    if (confirm(`ต้องการลบหมวดหมู่ "${category.name}" หรือไม่?`)) {
      deleteMutation.mutate({ id: category.id });
    }
  };

  const handleToggleActive = (category: Category) => {
    updateMutation.mutate({
      id: category.id,
      isActive: !category.isActive,
    });
  };

  // Loading State
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
            จัดการหมวดหมู่
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            เพิ่มและแก้ไขหมวดหมู่สินค้า
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
          เพิ่มหมวดหมู่
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          <CategoriesTable
            categories={categories ?? []}
            onEdit={setEditingCategory}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </div>
      </main>

      {/* Modals */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
      />

      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSave={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
