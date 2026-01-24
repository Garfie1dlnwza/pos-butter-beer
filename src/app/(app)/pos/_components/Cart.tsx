"use client";

import type { CartItem } from "../page";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onClear: () => void;
  total: number;
}
export function Cart({ items, onUpdateQuantity, onClear, total }: CartProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-bold tracking-tight">Shopping Bag</h2>
        <span className="rounded-full bg-[#FFF8E1] px-3 py-1 text-xs font-bold text-[#3E2723]">
          {items.reduce((a, b) => a + b.quantity, 0)} items
        </span>
      </div>

      <div className="flex-1 overflow-auto px-6">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#D7CCC8]">
            <p className="font-medium">No items selected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 border-b border-[#F5F5F5] pb-4"
              >
                <div className="flex justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-[#3E2723]">{item.nameTh}</h4>
                    <p className="text-xs text-[#8D6E63]">
                      Sweetness: {item.sweetness}%{" "}
                      {item.toppings.length > 0 &&
                        `+ ${item.toppings.map((t) => t.name).join(", ")}`}
                    </p>
                  </div>
                  <span className="font-bold text-[#3E2723]">
                    ฿
                    {(
                      (item.price + item.toppingCost) *
                      item.quantity
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-xl bg-[#F5F5F5] p-1">
                    <button
                      onClick={() => onUpdateQuantity(index, -1)}
                      className="h-8 w-8 rounded-lg text-lg transition-colors hover:bg-white"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(index, 1)}
                      className="h-8 w-8 rounded-lg text-lg transition-colors hover:bg-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onUpdateQuantity(index, -item.quantity)}
                    className="text-xs font-bold tracking-tighter text-red-400 uppercase"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#FFF8E1]/50 p-6">
        <div className="mb-1 flex items-center justify-between text-sm text-[#8D6E63]">
          <span>Subtotal</span>
          <span>฿{total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-[#3E2723]">
          <span className="text-lg font-bold">Total Amount</span>
          <span className="text-3xl font-black">฿{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
