"use client";

import type { CartItem } from "../page";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onClear: () => void;
  total: number;
}

export function Cart({ items, onUpdateQuantity, onClear, total }: CartProps) {
  const totalItems = items.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0F0F0] px-6 py-5">
        <h2 className="text-lg font-bold text-[#3E2723]">รายการสั่งซื้อ</h2>
        {totalItems > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#8D6E63]">
              {totalItems} รายการ
            </span>
            <button
              onClick={onClear}
              className="cursor-pointer text-[10px] text-[#BDBDBD] underline transition-colors hover:text-red-400"
            >
              ล้างทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 opacity-30">
            {/* Empty State Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 text-[#8D6E63]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <p className="text-sm font-medium text-[#8D6E63]">ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5F5]">
            {items.map((item, index) => (
              <div
                key={index}
                className="group/item px-6 py-4 transition-colors hover:bg-[#FAFAFA]"
              >
                {/* Row 1: Name & Price */}
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="leading-snug font-semibold text-[#3E2723]">
                      {item.nameTh}
                    </h4>
                    {/* Details - Sweetness & Toppings */}
                    <div className="mt-1 flex flex-wrap gap-1 text-xs text-[#8D6E63]">
                      <span className="rounded bg-[#FFF8E1] px-1.5 py-0.5 text-[#5D4037]">
                        หวาน {item.sweetness}%
                      </span>
                      {item.toppings.map((t) => (
                        <span
                          key={t.id}
                          className="rounded bg-[#F5F5F5] px-1.5 py-0.5 text-[#5D4037]"
                        >
                          + {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-right font-bold text-[#3E2723]">
                    ฿
                    {(
                      (item.price + item.toppingCost) *
                      item.quantity
                    ).toLocaleString()}
                  </span>
                </div>

                {/* Row 2: Quantity Controls & Trash Icon */}
                <div className="flex items-center justify-between pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(index, -1)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#E0E0E0] text-sm font-medium text-[#5D4037] transition-all hover:border-[#D7CCC8] hover:bg-white active:scale-95"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#3E2723]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(index, 1)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#E0E0E0] text-sm font-medium text-[#5D4037] transition-all hover:border-[#D7CCC8] hover:bg-white active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Trash Icon Button */}
                  <button
                    onClick={() => onUpdateQuantity(index, -item.quantity)}
                    title="ลบรายการ"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#BDBDBD] transition-all hover:bg-red-50 hover:text-red-500 active:scale-90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Total */}
      {items.length > 0 && (
        <div className="border-t border-[#E0E0E0] bg-[#FAFAFA] px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8D6E63]">
              รวมทั้งหมด
            </span>
            <span className="text-2xl font-bold text-[#3E2723]">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
