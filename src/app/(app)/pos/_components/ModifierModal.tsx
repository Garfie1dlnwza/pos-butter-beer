"use client";

import { useState } from "react";

interface Topping {
  id: string;
  name: string;
  nameTh: string | null;
  price: number;
}

interface ModifierModalProps {
  product: {
    id: string;
    name: string;
    nameTh: string;
    price: number;
  };
  toppings: Topping[];
  onConfirm: (
    sweetness: number,
    selectedToppings: Array<{ id: string; name: string; price: number }>,
  ) => void;
  onClose: () => void;
}

const SWEETNESS_OPTIONS = [
  { value: 0, label: "0%", subLabel: "No Sugar" },
  { value: 50, label: "50%", subLabel: "Less Sweet" },
  { value: 100, label: "100%", subLabel: "Normal" },
];

export function ModifierModal({
  product,
  toppings,
  onConfirm,
  onClose,
}: ModifierModalProps) {
  const [sweetness, setSweetness] = useState(100);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const selectedToppingDetails = toppings
    .filter((t) => selectedToppings.includes(t.id))
    .map((t) => ({
      id: t.id,
      name: t.nameTh ?? t.name,
      price: t.price,
    }));

  const toppingTotal = selectedToppingDetails.reduce(
    (sum, t) => sum + t.price,
    0,
  );
  const itemTotal = product.price + toppingTotal;

  const handleConfirm = () => {
    onConfirm(sweetness, selectedToppingDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2723]/40 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-200">
        {/* Header Section */}
        <div className="flex items-start justify-between p-8 pb-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#3E2723]">
              {product.nameTh}
            </h3>
            <p className="text-sm font-medium tracking-wider text-[#8D6E63] uppercase">
              Base Price: ฿{product.price}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-[#3E2723] transition-colors hover:bg-[#D7CCC8]/30"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[60vh] overflow-y-auto px-8 py-2">
          {/* Sweetness Selection */}
          <div className="mb-8">
            <label className="mb-4 block text-[10px] font-bold tracking-[0.2em] text-[#8D6E63] uppercase">
              Sweetness Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SWEETNESS_OPTIONS.map((option) => {
                const isActive = sweetness === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSweetness(option.value)}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 py-4 transition-all duration-200 ${
                      isActive
                        ? "border-[#3E2723] bg-[#3E2723] text-white shadow-lg shadow-[#3E2723]/20"
                        : "border-[#F5F5F5] bg-white text-[#3E2723] hover:border-[#D7CCC8]"
                    }`}
                  >
                    <span className="text-lg font-bold">{option.label}</span>
                    <span
                      className={`mt-0.5 text-[10px] ${isActive ? "text-[#D7CCC8]" : "text-[#8D6E63]"}`}
                    >
                      {option.subLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toppings Selection */}
          {toppings.length > 0 && (
            <div className="mb-8">
              <label className="mb-4 block text-[10px] font-bold tracking-[0.2em] text-[#8D6E63] uppercase">
                Custom Add-ons
              </label>
              <div className="space-y-2">
                {toppings.map((topping) => {
                  const isSelected = selectedToppings.includes(topping.id);
                  return (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(topping.id)}
                      className={`group flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all duration-200 ${
                        isSelected
                          ? "border-[#3E2723]/30 bg-[#FFF8E1]"
                          : "border-transparent bg-[#F5F5F5] hover:border-[#D7CCC8]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                            isSelected
                              ? "border-[#3E2723] bg-[#3E2723]"
                              : "border-[#D7CCC8] bg-white"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={4}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-[#3E2723]">
                          {topping.nameTh ?? topping.name}
                        </span>
                      </div>
                      <span
                        className={`font-medium ${isSelected ? "text-[#3E2723]" : "text-[#8D6E63]"}`}
                      >
                        +฿{topping.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="border-t border-[#F5F5F5] bg-white p-8 pt-4">
          <button
            onClick={handleConfirm}
            className="flex w-full items-center justify-between rounded-[1.5rem] bg-[#3E2723] px-8 py-5 text-lg font-bold text-white transition-all hover:bg-[#5D4037] active:scale-[0.98]"
          >
            <span>Add to Order</span>
            <span className="text-[#FFF8E1]">
              ฿{itemTotal.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
