"use client";

import Image from "next/image";

interface Category {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number;
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

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E1]">
          <svg
            className="h-8 w-8 text-[#D7CCC8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#3E2723]">ยังไม่มีสินค้า</p>
          <p className="mt-1 text-sm text-[#8D6E63]">
            กดปุ่ม &quot;เพิ่มสินค้า&quot; เพื่อเริ่มต้น
          </p>
        </div>
      </div>
    );
  }

  // Sort products by category logic
  const sortedProducts = [...products].sort((a, b) => {
    // Put products with no category at the end
    if (!a.category) return 1;
    if (!b.category) return -1;

    // Sort by category sortOrder
    if (a.category.sortOrder !== b.category.sortOrder) {
      return a.category.sortOrder - b.category.sortOrder;
    }

    // Then by category name
    if (a.category.name !== b.category.name) {
      return a.category.name.localeCompare(b.category.name);
    }

    // Then by product name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E0E0E0]">
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              สินค้า
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              หมวดหมู่
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              ราคา
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              สถานะ
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5F5F5]">
          {sortedProducts.map((product, index) => {
            const showHeader =
              index === 0 ||
              product.category?.id !== sortedProducts[index - 1]?.category?.id;

            return (
              <>
                {showHeader && product.category && (
                  <tr className="bg-[#EFEBE9]/50">
                    <td
                      colSpan={5}
                      className="px-6 py-2 text-sm font-bold text-[#5D4037]"
                    >
                      {product.category.name}
                    </td>
                  </tr>
                )}
                {showHeader &&
                  !product.category &&
                  products.some((p) => p.category) && (
                    <tr className="bg-[#EFEBE9]/50">
                      <td
                        colSpan={5}
                        className="px-6 py-2 text-sm font-bold text-[#5D4037]"
                      >
                        Other / Uncategorized
                      </td>
                    </tr>
                  )}
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-[#FAFAFA]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FFF8E1]">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#D7CCC8]">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Name */}
                      <div>
                        <p className="font-semibold text-[#3E2723]">
                          {product.nameTh ?? product.name}
                        </p>
                        {product.nameTh && (
                          <p className="text-xs text-[#8D6E63]">
                            {product.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.category ? (
                      <span className="rounded-full bg-[#FFF8E1] px-2.5 py-1 text-xs font-medium text-[#5D4037]">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-[#BDBDBD]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-[#3E2723]">
                    ฿{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggleActive(product)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                        product.isActive
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {product.isActive ? "เปิดขาย" : "ปิดขาย"}
                    </button>
                  </td>
                  <td className="max-w-fit px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => onEdit(product)}
                        className="cursor-pointer rounded-lg p-2 text-[#8D6E63] transition hover:bg-[#FFF8E1] hover:text-[#5D4037]"
                        title="แก้ไข"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => onDelete(product)}
                        className="cursor-pointer rounded-lg p-2 text-[#BDBDBD] transition hover:bg-red-50 hover:text-red-500"
                        title="ลบ"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
