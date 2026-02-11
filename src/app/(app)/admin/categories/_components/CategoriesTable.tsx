"use client";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoriesTableProps) {
  if (categories.length === 0) {
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#3E2723]">ยังไม่มีหมวดหมู่</p>
          <p className="mt-1 text-sm text-[#8D6E63]">
            กดปุ่ม &quot;เพิ่มหมวดหมู่&quot; เพื่อเริ่มต้น
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E0E0E0]">
            <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              ลำดับ
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              ชื่อหมวดหมู่
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              จำนวนสินค้า
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
          {categories.map((category) => (
            <tr
              key={category.id}
              className="transition-colors hover:bg-[#FAFAFA]"
            >
              <td className="px-6 py-4 text-center font-mono text-sm text-[#8D6E63]">
                {category.sortOrder}
              </td>
              <td className="px-6 py-4">
                <span className="font-semibold text-[#3E2723]">
                  {category.name}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="rounded-full bg-[#EFEBE9] px-2.5 py-1 text-xs font-medium text-[#5D4037]">
                  {category._count?.products ?? 0} รายการ
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onToggleActive(category)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                    category.isActive
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {category.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(category)}
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
                    onClick={() => onDelete(category)}
                    className="cursor-pointer rounded-lg p-2 text-[#BDBDBD] transition hover:bg-red-50 hover:text-red-500"
                    title="ลบ"
                    disabled={
                      category._count?.products
                        ? category._count.products > 0
                        : false
                    }
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
