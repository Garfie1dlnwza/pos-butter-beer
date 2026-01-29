"use client";

import { useState } from "react";
import Image from "next/image";
import { getFileUrl } from "@/lib/storage";

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
    description: string | null;
    image: string | null;
  };
  toppings: Topping[];
  onConfirm: (
    sweetness: number,
    selectedToppings: Array<{ id: string; name: string; price: number }>,
  ) => void;
  onClose: () => void;
}

const SWEETNESS_OPTIONS = [
  { value: 25, label: "25%", subLabel: "หวานน้อยมาก" },
  { value: 50, label: "50%", subLabel: "หวานน้อย" },
  { value: 100, label: "100%", subLabel: "หวาน" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2723]/60 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-200">
        <div className="flex h-full max-h-[85vh] flex-col lg:flex-row">
          {/* LEFT: Image & Info */}
          <div className="relative flex-1 bg-[#F9F9F9] lg:max-w-md">
            <button
              onClick={onClose}
              className="absolute top-6 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#3E2723] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
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
            <div className="relative h-64 w-full lg:h-full">
              {product.image ? (
                <Image
                  src={getFileUrl(product.image)}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#FFF8E1] text-[#D7CCC8]">
                  <span className="text-6xl font-bold opacity-30">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
              {/* Gradient overlay for text readability on mobile if needed, or visual flair */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent lg:hidden" />
            </div>
          </div>

          {/* RIGHT: Validation & Actions */}
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="shrink-0 p-8 pb-4">
              <h3 className="text-3xl leading-tight font-black text-[#3E2723]">
                {product.nameTh}
              </h3>
              <p className="mt-1 text-lg font-medium text-[#8D6E63]">
                {product.name}
              </p>
              {product.description && (
                <p className="mt-4 text-sm leading-relaxed font-light text-[#8D6E63]/80">
                  {product.description}
                </p>
              )}
            </div>

            {/* Scrollable Options */}
            <div className="scrollbar-thin scrollbar-thumb-[#D7CCC8] scrollbar-track-transparent flex-1 overflow-y-auto px-8 py-2">
              {/* Price Tag */}
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-full bg-[#FFF8E1] px-4 py-1.5 text-lg font-bold text-[#3E2723]">
                  ฿{product.price.toLocaleString()}
                </div>
              </div>

              {/* Sweetness Selection */}
              <div className="mb-8">
                <label className="mb-4 block text-xs font-bold tracking-[0.2em] text-[#8D6E63] uppercase">
                  ระดับความหวาน (Sweetness)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SWEETNESS_OPTIONS.map((option) => {
                    const isActive = sweetness === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSweetness(option.value)}
                        className={`flex flex-col items-center justify-center rounded-2xl border-2 py-3 transition-all duration-200 ${
                          isActive
                            ? "scale-[1.02] border-[#3E2723] bg-[#3E2723] text-white shadow-lg shadow-[#3E2723]/20"
                            : "border-[#F5F5F5] bg-white text-[#3E2723] hover:border-[#D7CCC8]"
                        }`}
                      >
                        <span className="text-lg font-bold">
                          {option.label}
                        </span>
                        <span
                          className={`mt-0.5 text-xs ${isActive ? "text-[#D7CCC8]" : "text-[#8D6E63]"}`}
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
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-bold tracking-[0.2em] text-[#8D6E63] uppercase">
                      เพิ่มท็อปปิ้ง (Toppings)
                    </label>
                    <span className="rounded-md bg-[#F5F5F5] px-2 py-1 text-[10px] text-[#8D6E63]">
                      เลือกได้หลายอย่าง
                    </span>
                  </div>

                  <div className="space-y-2">
                    {toppings.map((topping) => {
                      const isSelected = selectedToppings.includes(topping.id);
                      return (
                        <button
                          key={topping.id}
                          onClick={() => toggleTopping(topping.id)}
                          className={`group flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
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
            <div className="shrink-0 border-t border-[#F5F5F5] bg-white p-6 lg:p-8">
              <button
                onClick={handleConfirm}
                className="flex w-full items-center justify-between rounded-[1.25rem] bg-[#3E2723] px-6 py-4 text-lg font-bold text-white shadow-xl shadow-[#3E2723]/20 transition-all hover:bg-[#5D4037] active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span>เพิ่มลงตะกร้า</span>
                </div>
                <span className="rounded-lg bg-[#533934] px-3 py-1 text-[#FFF8E1]">
                  ฿{itemTotal.toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
