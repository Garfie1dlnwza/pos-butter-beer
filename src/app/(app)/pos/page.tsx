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

  const { data: products, isLoading } = api.products.getAll.useQuery();
  const { data: toppings } = api.toppings.getAll.useQuery();

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFF8E1]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3E2723] border-t-transparent"></div>
          <p className="font-medium text-[#3E2723] tracking-widest uppercase text-xs">Loading Menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FFF8E1]">
      {/* Product Grid - Left Side */}
      <div className="flex-1 overflow-auto px-8 py-8">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-[#3E2723]">
              Butter Beer
            </h1>
            <p className="mt-1 text-[#8D6E63] font-medium tracking-wide">Select items to start a new order</p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#8D6E63]">Station 01</span>
            <span className="text-sm font-bold text-[#3E2723]">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </header>

        <ProductGrid products={products ?? []} onSelect={handleProductSelect} />
      </div>

      {/* Cart - Right Side */}
      <div className="flex w-[420px] flex-col border-l border-[#D7CCC8]/50 bg-white shadow-2xl">
        <Cart
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onClear={handleClearCart}
          total={cartTotal}
        />

        {/* Checkout Button Area */}
        <div className="p-8 border-t border-[#F5F5F5]">
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="flex w-full items-center justify-between rounded-2xl bg-[#3E2723] px-8 py-5 text-lg font-bold text-white shadow-xl shadow-[#3E2723]/20 transition-all hover:bg-[#5D4037] active:scale-[0.98] disabled:opacity-20 disabled:grayscale"
          >
            <span>Proceed to Payment</span>
            <span className="text-[#FFF8E1]">฿{cartTotal.toLocaleString()}</span>
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