"use client";

import { StockBadge } from "./StockBadge";

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

interface IngredientsTableProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  onAddStock: (ingredient: Ingredient) => void;
}

export function IngredientsTable({
  ingredients,
  onEdit,
  onDelete,
  onAddStock,
}: IngredientsTableProps) {
  if (ingredients.length === 0) {
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
          <p className="font-semibold text-[#3E2723]">ยังไม่มีวัตถุดิบ</p>
          <p className="mt-1 text-sm text-[#8D6E63]">
            กดปุ่ม &quot;เพิ่มวัตถุดิบ&quot; เพื่อเริ่มต้น
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
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              วัตถุดิบ
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              หน่วย
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              ต้นทุน/หน่วย
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              สต็อก
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
          {ingredients.map((ingredient) => (
            <tr
              key={ingredient.id}
              className="transition-colors hover:bg-[#FAFAFA]"
            >
              <td className="px-6 py-4">
                <span className="font-semibold text-[#3E2723]">
                  {ingredient.name}
                </span>
              </td>
              <td className="px-6 py-4 text-[#5D4037]">{ingredient.unit}</td>
              <td className="px-6 py-4 text-right font-mono text-[#5D4037]">
                ฿{ingredient.costPerUnit.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right">
                <span className="font-mono font-semibold text-[#3E2723]">
                  {ingredient.currentStock.toLocaleString()}
                </span>
                <span className="ml-1 text-sm text-[#BDBDBD]">
                  / {ingredient.minStock}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <StockBadge
                  currentStock={ingredient.currentStock}
                  minStock={ingredient.minStock}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  {/* Add Stock */}
                  <button
                    onClick={() => onAddStock(ingredient)}
                    className="cursor-pointer rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                    title="เพิ่มสต็อก"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(ingredient)}
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
                    onClick={() => onDelete(ingredient)}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
