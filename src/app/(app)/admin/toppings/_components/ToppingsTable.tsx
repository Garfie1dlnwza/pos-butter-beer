interface Topping {
  id: string;
  name: string;
  nameTh: string | null;
  price: number;
  isActive: boolean;
  recipe?: Array<{
    ingredient: { name: string; unit: string };
    amountUsed: number;
  }>;
}

interface ToppingsTableProps {
  toppings: Topping[];
  onEdit: (topping: Topping) => void;
  onDelete: (topping: Topping) => void;
  onToggleActive: (topping: Topping) => void;
}

export function ToppingsTable({
  toppings,
  onEdit,
  onDelete,
  onToggleActive,
}: ToppingsTableProps) {
  return (
    <table className="w-full text-left">
      <thead className="border-b border-[#E0E0E0] bg-[#FFF8E1]/50">
        <tr>
          <th className="px-6 py-4 text-xs font-bold tracking-wider text-[#5D4037] uppercase">
            สถานะ
          </th>
          <th className="px-6 py-4 text-xs font-bold tracking-wider text-[#5D4037] uppercase">
            ชื่อท็อปปิ้ง
          </th>
          <th className="px-6 py-4 text-xs font-bold tracking-wider text-[#5D4037] uppercase">
            ราคาบวกเพิ่ม
          </th>
          <th className="px-6 py-4 text-xs font-bold tracking-wider text-[#5D4037] uppercase">
            สูตร (วัตถุดิบ)
          </th>
          <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#5D4037] uppercase">
            จัดการ
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F5F5F5]">
        {toppings.map((topping) => (
          <tr key={topping.id} className="group transition hover:bg-gray-50">
            <td className="px-6 py-4">
              <button
                onClick={() => onToggleActive(topping)}
                className={`flex h-6 w-11 cursor-pointer items-center rounded-full px-1 transition-colors ${
                  topping.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    topping.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </td>
            <td className="px-6 py-4">
              <p className="font-bold text-[#3E2723]">{topping.name}</p>
              {topping.nameTh && (
                <p className="text-sm text-[#8D6E63]">{topping.nameTh}</p>
              )}
            </td>
            <td className="px-6 py-4">
              <span className="rounded-lg bg-[#EFEBE9] px-2 py-1 text-sm font-bold text-[#5D4037]">
                +฿{topping.price.toLocaleString()}
              </span>
            </td>
            <td className="px-6 py-4">
              {topping.recipe && topping.recipe.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {topping.recipe.map((r, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded border border-amber-100 bg-amber-50 px-2 py-1 text-xs text-amber-800"
                    >
                      {r.ingredient.name} ({r.amountUsed} {r.ingredient.unit})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">ไม่มีสูตร</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onEdit(topping)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#8D6E63] transition hover:bg-[#EFEBE9] hover:text-[#5D4037]"
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
                <button
                  onClick={() => onDelete(topping)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-300 transition hover:bg-red-50 hover:text-red-500"
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
  );
}
