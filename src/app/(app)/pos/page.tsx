"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { ProductGrid } from "./_components/ProductGrid";
import { Cart } from "./_components/Cart";
import { ModifierModal } from "./_components/ModifierModal";
import { PaymentPanel } from "./_components/PaymentPanel";

export interface CartItem {
  productId: string;
  name: string;
  nameTh: string;
  price: number;
  quantity: number;
  sweetness: number;
  toppings: Array<{ id: string; name: string; price: number }>;
  toppingCost: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    nameTh: string;
    price: number;
  } | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const { data: products, isLoading: isProductsLoading } =
    api.products.getAll.useQuery();
  const { data: toppings } = api.toppings.getAll.useQuery();
  const { data: categoriesData } = api.categories.getAll.useQuery();
  const { data: currentShift, isLoading: isShiftLoading } =
    api.shifts.getCurrentShift.useQuery();
  const { data: session } = api.auth.getSession.useQuery();

  const categories = categoriesData as
    | { id: string; name: string }[]
    | undefined;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const handleProductSelect = (product: {
    id: string;
    name: string;
    nameTh: string | null;
    price: number;
  }) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      nameTh: product.nameTh ?? product.name,
      price: product.price,
    });
  };

  const handleAddToCart = (
    sweetness: number,
    selectedToppings: Array<{ id: string; name: string; price: number }>,
  ) => {
    if (!selectedProduct) return;

    const toppingCost = selectedToppings.reduce((sum, t) => sum + t.price, 0);

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === selectedProduct.id &&
        item.sweetness === sweetness &&
        JSON.stringify(item.toppings) === JSON.stringify(selectedToppings),
    );

    if (existingIndex >= 0) {
      setCart((prev) =>
        prev.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          nameTh: selectedProduct.nameTh,
          price: selectedProduct.price,
          quantity: 1,
          sweetness,
          toppings: selectedToppings,
          toppingCost,
        },
      ]);
    }
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleClearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.price + item.toppingCost) * item.quantity,
    0,
  );

  const handlePaymentComplete = () => {
    setCart([]);
    setShowPayment(false);
  };

  const filteredProducts =
    products?.filter(
      (p) =>
        selectedCategoryId === "all" || p.categoryId === selectedCategoryId,
    ) ?? [];

  // Minimal Loading State
  if (isProductsLoading || isShiftLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
          Loading System
        </span>
      </div>
    );
  }

  // --- SHIFT CHECK (Blocking for STAFF) ---
  const isStaff = session?.user.role === "STAFF";
  if (isStaff && !currentShift) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] p-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <span className="text-5xl">🛑</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#3E2723]">
          กรุณาเปิดกะก่อนเริ่มขาย
        </h1>
        <p className="mb-8 max-w-md text-[#8D6E63]">
          คุณต้องเปิดกะในระบบก่อน จึงจะสามารถทำรายการขายสินค้าได้
          เพื่อการตรวจสอบยอดเงินที่ถูกต้อง
        </p>
        <a
          href="/staff/shifts"
          className="rounded-xl bg-green-600 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-green-700"
        >
          ไปยังหน้าเปิดกะ 🚀
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA] lg:flex-row">
      {/* LEFT SIDE: Product Grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
          <div>
            <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
              Butter Beer
            </h1>
            <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
              {currentShift
                ? `Shift Open: ${new Date(currentShift.startedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`
                : "Manager Mode"}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[10px] font-bold tracking-[0.2em] text-[#8D6E63] uppercase">
              Station 01
            </div>
            <div className="mt-0.5 text-sm font-bold text-[#3E2723]">
              {new Date().toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto border-b border-[#D7CCC8]/30 px-6 py-4 lg:px-10">
          <button
            onClick={() => setSelectedCategoryId("all")}
            className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === "all"
                ? "scale-105 transform bg-[#3E2723] text-white shadow-md"
                : "bg-white text-[#8D6E63] hover:bg-[#F5F5F5]"
            }`}
          >
            ทั้งหมด
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? "scale-105 transform bg-[#3E2723] text-white shadow-md"
                  : "bg-white text-[#8D6E63] hover:bg-[#F5F5F5]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Scrollable Grid Area */}
        <main className="scrollbar-hide flex-1 overflow-y-auto p-6 lg:p-10">
          <ProductGrid
            products={filteredProducts.sort((a, b) => {
              // Sort by category sortOrder
              const orderA = a.category?.sortOrder ?? 999;
              const orderB = b.category?.sortOrder ?? 999;
              if (orderA !== orderB) return orderA - orderB;
              return 0;
            })}
            onSelect={handleProductSelect}
          />
        </main>
      </div>

      {/* RIGHT SIDE: Cart & Checkout */}
      <div className="flex w-full flex-col border-t border-[#D7CCC8]/50 bg-white lg:h-full lg:w-[400px] lg:border-t-0 lg:border-l">
        <div className="flex-1 overflow-y-auto">
          <Cart
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onClear={handleClearCart}
            total={cartTotal}
          />
        </div>

        {/* Footer / Payment Section */}
        <div className="bg-[#FFF8E1]/50 p-6">
          <div className="mb-4 flex items-center justify-between text-[#5D4037]">
            <span className="text-sm font-medium">Total Items</span>
            <span className="text-sm font-bold">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="group relative w-full overflow-hidden rounded-lg bg-[#3E2723] py-4 text-white transition-all hover:bg-[#2D1B18] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#D7CCC8]"
          >
            <div className="flex items-center justify-between px-6">
              <span className="text-sm font-bold tracking-widest uppercase">
                Pay Now
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium opacity-80">THB</span>
                <span className="text-xl font-bold">
                  {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ModifierModal
          product={selectedProduct}
          toppings={toppings ?? []}
          onConfirm={handleAddToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showPayment && (
        <PaymentPanel
          items={cart}
          total={cartTotal}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
