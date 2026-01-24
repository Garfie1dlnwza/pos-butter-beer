"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { ProductsTable } from "./_components/ProductsTable";
import { ProductModal } from "./_components/ProductModal";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Product {
  id: string;
  name: string;
  nameTh: string | null;
  price: number;
  categoryId: string | null;
  category: Category | null;
  image: string | null;
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  nameTh: string;
  price: number;
  categoryId: string | null;
  image: string | null;
}

export default function ProductsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const utils = api.useUtils();
  const { data: products, isLoading } = api.products.getAllAdmin.useQuery();
  const { data: categoriesData } = api.categories.getAll.useQuery();
  const categories = categoriesData as
    | { id: string; name: string }[]
    | undefined;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const createMutation = api.products.create.useMutation({
    onSuccess: () => {
      void utils.products.getAllAdmin.invalidate();
      setShowCreateModal(false);
    },
  });

  const updateMutation = api.products.update.useMutation({
    onSuccess: () => {
      void utils.products.getAllAdmin.invalidate();
      setEditingProduct(null);
    },
  });

  const deleteMutation = api.products.delete.useMutation({
    onSuccess: () => {
      void utils.products.getAllAdmin.invalidate();
    },
  });

  const deleteImageMutation = api.products.deleteImage.useMutation({
    onSuccess: () => {
      void utils.products.getAllAdmin.invalidate();
    },
  });

  const handleCreate = (data: ProductFormData) => {
    createMutation.mutate({
      name: data.name,
      nameTh: data.nameTh || undefined,
      price: data.price,
      categoryId: data.categoryId || undefined,
      image: data.image ?? undefined,
    });
  };

  const handleUpdate = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateMutation.mutate({
      id: editingProduct.id,
      name: data.name,
      nameTh: data.nameTh || undefined,
      price: data.price,
      categoryId: data.categoryId,
      image: data.image ?? undefined,
    });
  };

  const handleDelete = (product: Product) => {
    if (confirm(`ต้องการลบ "${product.nameTh ?? product.name}" หรือไม่?`)) {
      deleteMutation.mutate({ id: product.id });
    }
  };

  const handleToggleActive = (product: Product) => {
    updateMutation.mutate({
      id: product.id,
      isActive: !product.isActive,
    });
  };

  const handleDeleteImage = () => {
    if (editingProduct) {
      deleteImageMutation.mutate({ id: editingProduct.id });
    }
  };

  const filteredProducts =
    products?.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameTh?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryId === "all" || p.categoryId === selectedCategoryId;

      return matchesSearch && matchesCategory;
    }) ?? [];

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
            จัดการสินค้า
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            เพิ่ม แก้ไข และจัดการเมนูสินค้าทั้งหมด
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
          เพิ่มสินค้า
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Search Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
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
              placeholder="ค้นหาสินค้า..."
              className="w-full rounded-xl border border-[#D7CCC8]/50 bg-white py-3 pr-4 pl-12 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                selectedCategoryId === "all"
                  ? "bg-[#3E2723] text-white shadow-md"
                  : "bg-white text-[#8D6E63] hover:bg-[#F5F5F5]"
              }`}
            >
              ทั้งหมด
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                  selectedCategoryId === cat.id
                    ? "bg-[#3E2723] text-white shadow-md"
                    : "bg-white text-[#8D6E63] hover:bg-[#F5F5F5]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          <ProductsTable
            products={filteredProducts}
            onEdit={setEditingProduct}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </div>

        {/* Summary Stats */}
        {products && products.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-[#8D6E63]">
                สินค้าทั้งหมด
              </p>
              <p className="text-3xl font-bold text-[#3E2723]">
                {products.length}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-700">เปิดขาย</p>
              <p className="text-3xl font-bold text-emerald-600">
                {products.filter((p) => p.isActive).length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-600">ปิดขาย</p>
              <p className="text-3xl font-bold text-gray-500">
                {products.filter((p) => !p.isActive).length}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
      />

      <ProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSave={handleUpdate}
        onDeleteImage={handleDeleteImage}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
